import { Member as DefaultMember, Link as DefaultLink } from '../orgShape';
import { Member as EditableMember, Link as EditableLink } from '../orgChangeShape';
import dayjs from 'dayjs';

export const getShapes = (editable: boolean) => {
    return {
        Member: editable ? EditableMember : DefaultMember,
        Link: editable ? EditableLink : DefaultLink,
    };
};

export function createMember(
    label: string,
    description: string,
    chipText: string,
    editable: boolean,
    level?: string,
    end_ymd?: string,
    bgng_ymd?: string,
    child_no?: string,
    parent_no?: string,
    corp_eng_nm?: string,
    ognz_type_cd?: string,
    action_type?: string
) {
    const { Member } = getShapes(editable);
    return new Member({
        attrs: {
            label: {
                text: label,
            },
            description: {
                text: description,
            },
            chipText: {
                text: chipText,
            },
            memberAddButton: {
                display: editable ? 'block' : 'none',
            },
        },
        data: {
            level: level || '',
            end_ymd: end_ymd || '',
            ognz_nm: label || '',
            bgng_ymd: bgng_ymd || '',
            child_no: child_no || '',
            parent_no: parent_no || '',
            corp_eng_nm: corp_eng_nm || '',
            ognz_type_cd: ognz_type_cd || '',
            action_type: action_type || '',
        },
    });
}

export function createLink(source, target, editable = false) {
    const { Link } = getShapes(editable);
    return new Link({
        source: { id: source.id },
        target: { id: target.id },
    });
}

export function generateOgnzNo() {
    return Date.now().toString();
}

export function getDefaultFormData() {
    return {
        level: '',
        end_ymd: '',
        ognz_nm: '',
        bgng_ymd: '',
        child_no: '',
        parent_no: '',
        corp_eng_nm: '',
        ognz_type_cd: '',
        action_type: '',
    };
}

export function formattedDate(date?: string) {
    if (!date) return null;
    return date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
}

export function processOrgChartData(masterData, editable) {
    // masterData가 undefined, null이거나 배열이 아닌 경우 처리
    if (!masterData) {
        console.warn('Master data is undefined or null');
        return { members: [], connections: [] };
    }

    // masterData가 배열이 아닌 경우 배열로 변환
    if (!Array.isArray(masterData)) {
        console.warn('Master data is not an array, converting to array format');
        // 객체인 경우 배열로 변환하여 처리
        if (typeof masterData === 'object') {
            masterData = [masterData];
        } else {
            // 배열도 객체도 아닌 경우 빈 배열 반환
            return { members: [], connections: [] };
        }
    }

    if (masterData.length === 0) {
        console.warn('No master data provided (empty array)');
        return { members: [], connections: [] };
    }

    const newMembers = {};
    const newConnections = [];
    console.log('masterData', masterData);
    for (const item of masterData) {
        newMembers[item.child_no] = {
            parent_no: item.parent_no,
            data: createMember(
                item.ognz_nm,
                '직책 이름',
                '총 ' + (item?.orgMembers?.length ?? '0') + '명',
                editable,
                item.level,
                item.end_ymd,
                item.bgng_ymd,
                item.child_no,
                item.parent_no,
                item.corp_eng_nm,
                item.ognz_type_cd,
                item.action_type || ''
            ),
        };
    }

    const dataArray = Object.values(newMembers).map((item: any) => item.data);

    for (const member in newMembers) {
        if (newMembers[member].parent_no) {
            newConnections.push(
                createLink(newMembers[newMembers[member].parent_no].data, newMembers[member].data, editable)
            );
        }
    }

    return { members: dataArray, connections: newConnections };
}
