package saas.win.SaaSwin.sql.command.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;

@RequiredArgsConstructor
@Service
public class SqlService_temp {

    private final DataSource dataSource;

    private final JdbcTemplate jdbcTemplate; // datasource말고 이거쓰면 좀더 간편

    /*
    @Autowired
    private DataSource dataSource;

    @Transactional
    public void executeQuery() {
        try (Connection connection = dataSource.getConnection()) {
            // 커넥션을 이용하여 SQL 실행
            PreparedStatement stmt = connection.prepareStatement("SELECT * FROM my_table");
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                // 결과 처리
                System.out.println("Data: " + rs.getString("column_name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Transactional
    public void executeQuery() {
        String sql = "SELECT column_name FROM my_table";
        jdbcTemplate.query(sql, (rs, rowNum) -> {
            // 결과 처리
            System.out.println("Data: " + rs.getString("column_name"));
            return null;
        });
    }

    @Transactional  // 트랜잭션 처리
    public void updateUser(int id, String newName) {
        String sql1 = "UPDATE users SET name = ? WHERE id = ?";
        jdbcTemplate.update(sql1, newName, id);

        String sql2 = "INSERT INTO user_logs (user_id, action) VALUES (?, ?)";
        jdbcTemplate.update(sql2, id, "Name updated");
    }

    public void updateUser(int id, String newName) {
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setName("UserUpdateTransaction");
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
        TransactionStatus status = transactionManager.getTransaction(def);

        try {
            String sql1 = "UPDATE users SET name = ? WHERE id = ?";
            jdbcTemplate.update(sql1, newName, id);

            String sql2 = "INSERT INTO user_logs (user_id, action) VALUES (?, ?)";
            jdbcTemplate.update(sql2, id, "Name updated");

            // 트랜잭션 커밋
            transactionManager.commit(status);
        } catch (Exception e) {
            // 트랜잭션 롤백
            transactionManager.rollback(status);
            throw e;  // 예외를 다시 던져 호출자에게 알림
        }
    }

    // sql을 bean내의 필드에서 찾음. 없으면 찾아서 넣어줌
    public SqlDTO getSqlList(String sqlId) {

        // 없으면 null로 리턴
        if(StringUtils.isBlank(sqlId)) {
            return null;
        }

        // sqlid로 sql찾음
        SqlDTO dto = null;
        for (SqlDTO sql : sqlList) {
            if (sqlId.equals(sql.getSqlId())) {
                dto = sql;
                break;
            }
        }
        if(dto != null) {
            return dto;
        }

        // sql이 없다면 찾아서 넣어줌
        return dto;
    }
    */
}
