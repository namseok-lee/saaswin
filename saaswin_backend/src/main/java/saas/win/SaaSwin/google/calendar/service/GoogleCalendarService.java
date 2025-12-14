package saas.win.SaaSwin.google.calendar.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import saas.win.SaaSwin.Constants.SswConstants;
import saas.win.SaaSwin.google.calendar.dto.GoogleCalendarDTO;
import saas.win.SaaSwin.ssw.dto.response.SswResponseDTO;

import javax.sql.DataSource;
import java.sql.*;
import java.text.ParseException;
import java.util.*;
import java.util.Date;

@RequiredArgsConstructor
@Service
@Slf4j
public class GoogleCalendarService {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate; // datasource말고 이거쓰면 좀더 간편
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Transactional
    public SswResponseDTO googleCalendarApi(@RequestBody List<GoogleCalendarDTO> dtoList) throws ParseException, SQLException {

        SswResponseDTO res = new SswResponseDTO();

        res.setRtnCode(SswConstants.RESULT_CODE_SUCCESS);
        res.setRtnMsg(SswConstants.RESULT_MSG_SUCCESS);

        String sqlStirng = "INSERT INTO public.tom_schdl\n" +
                "(user_no, calnd_id, crt_dt, ocrn_type, ttl, cn, schdl_bgng_ymd, schdl_end_ymd, creatr_eml)\n" +
                "VALUES(:user_no, :calnd_id, :crt_dt, :ocrn_type, :ttl, :cn, :schdl_bgng_ymd, :schdl_end_ymd, :creatr_eml)";

        for(GoogleCalendarDTO dto : dtoList) {
            try (Connection connection = dataSource.getConnection();
                 PreparedStatement pstmt = connection.prepareStatement(sqlStirng)) {

                 final MapSqlParameterSource namedParameters = new MapSqlParameterSource()
                         .addValue("user_no", dto.getUsre_no())
                         .addValue("calnd_id", dto.getCalnd_id())
                         .addValue("crt_dt", dto.getCrt_dt())
                         .addValue("ocrn_type", dto.getOcrn_type())
                         .addValue("ttl", dto.getTtl())
                         .addValue("cn", dto.getCn())
                         .addValue("schdl_bgng_ymd", dto.getSchdl_bgng_ymd())
                         .addValue("schdl_end_ymd", dto.getSchdl_end_ymd())
                         .addValue("creatr_eml", dto.getCreatr_eml());

                 // truncate로 전체

                // 오늘 날짜 이후 싱크

                int cnt = namedParameterJdbcTemplate.update(sqlStirng, namedParameters);


            } catch (SQLException e) {
                log.error("error", e);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }


        return res;
    }
}
