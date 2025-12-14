import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { executeFunction } from '../../lib/db';

/**
 * ============================================================
 * X타입 화면별 설정 (sql_key → DB 함수 매핑)
 * ============================================================
 *
 * 새로운 X타입 화면 추가 시 여기에 매핑만 추가하면 됨!
 *
 * - dbFunc: 호출할 PostgreSQL 함수명
 * - scr_no: 화면번호
 */
const X_TYPE_CONFIG: Record<string, { dbFunc: string; scr_no: string }> = {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SM001T02 - 발령변경항목기준
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    hpo_apnt_chg_crtr_get: { dbFunc: 'saaswin_api_hpo_apnt01', scr_no: 'SM001T02' },
    hpo_apnt_ognz_chg_crtr_get: { dbFunc: 'saaswin_api_hpo_apnt01', scr_no: 'SM001T02' },
    hpo_apnt_chg_crtr_update: { dbFunc: 'saaswin_api_hpo_apnt01', scr_no: 'SM001T02' },
    hpo_apnt_ognz_chg_crtr_update: { dbFunc: 'saaswin_api_hpo_apnt01', scr_no: 'SM001T02' },
};

// 요청 DTO 타입
interface RequestDto {
    sqlId: string;
    sql_key: string;
    params?: Record<string, unknown>[];
}

// 응답 타입
interface ApiResponse {
    rtnCode: string;
    rtnMsg: string;
    resData: { sqlId: string; data: unknown[] }[];
}

/**
 * SSW-0002: X타입 화면 공통 API
 * @route POST /api/ssw/0002
 */
export default async function sswRoute0002(fastify: FastifyInstance) {
    fastify.post<{ Body: RequestDto[] }>(
        '/api/ssw/0002',
        async (request: FastifyRequest<{ Body: RequestDto[] }>, reply: FastifyReply) => {
            const dtoList = request.body;

            fastify.log.info({
                msg: '[/api/ssw/0002] Request received',
                timestamp: new Date().toISOString(),
                dtoCount: dtoList?.length,
            });

            const resList: { sqlId: string; data: unknown[] }[] = [];
            let returnCode = '';
            let returnMsg = '';

            for (const dto of dtoList) {
                const sqlId = dto.sqlId;
                const sqlKey = dto.sql_key;
                const params = dto.params?.[0] || {};

                fastify.log.info({ msg: 'SQL Info', sqlId, sqlKey });

                try {
                    // 매핑 테이블에서 설정 조회
                    const config = X_TYPE_CONFIG[sqlKey];

                    if (config) {
                        const isUpdate = sqlKey.includes('_update');
                        fastify.log.info(
                            `${isUpdate ? '[UPDATE]' : '[SELECT]'} - ${config.dbFunc} call (${config.scr_no})`
                        );

                        const pComParam = {
                            sql_key: sqlKey,
                            work_user_no:
                                (params as Record<string, unknown>).work_user_no ||
                                (params as Record<string, unknown>).user_no,
                            rprs_ognz_no: (params as Record<string, unknown>).rprs_ognz_no || 'WHNN',
                            scr_no: config.scr_no,
                            ...params,
                        };

                        const dbResult = await executeFunction(config.dbFunc, pComParam);

                        // 응답 파싱 (함수명을 키로 사용)
                        const firstRow = dbResult[0] as Record<string, unknown> | undefined;
                        const apiResult = firstRow?.[config.dbFunc] as Record<string, unknown> | undefined;

                        // 오류 체크
                        if (apiResult?.return_cd && apiResult.return_cd !== '40002') {
                            fastify.log.error({ msg: '[ERROR]', return_cd: apiResult.return_cd });
                            return reply.send({
                                rtnCode: apiResult.return_cd as string,
                                rtnMsg: (apiResult.error_msg as string) || '오류 발생',
                                resData: resList,
                            } satisfies ApiResponse);
                        }

                        returnCode = (apiResult?.return_cd as string) || '40002';
                        returnMsg = (apiResult?.error_msg as string) || 'SUCCESS';

                        resList.push({
                            sqlId: sqlId,
                            data: (apiResult?.data as unknown[]) || [],
                        });

                        continue;
                    }

                    // Unknown sql_key
                    fastify.log.warn({ msg: '[WARN] Unknown sql_key', sqlKey });
                    throw new Error(`지원하지 않는 sql_key: ${sqlKey}. X_TYPE_CONFIG에 매핑을 추가하세요.`);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                    fastify.log.error({ msg: 'API Error', error: errorMsg });

                    return reply.send({
                        rtnCode: '50000',
                        rtnMsg: errorMsg,
                        resData: [],
                    } satisfies ApiResponse);
                }
            }

            // 최종 응답 (Java의 SswResponseDTO와 동일)
            const response: ApiResponse = {
                rtnCode: returnCode || '40002',
                rtnMsg: returnCode === '40002' ? 'SUCCESS' : returnMsg,
                resData: resList,
            };

            fastify.log.info('[/api/ssw/0002] Response sent');

            return reply.send(response);
        }
    );
}
