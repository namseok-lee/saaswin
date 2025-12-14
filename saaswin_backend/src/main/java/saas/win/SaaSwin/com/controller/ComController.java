package saas.win.SaaSwin.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import saas.win.SaaSwin.com.service.ComService;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/{rprsOgnzNo}")
public class ComController {

    private final ComService comService;

    @PostMapping("/api/com/01")
    public ResponseEntity<List<Map<String, Object>>> comApi(@PathVariable("rprsOgnzNo") String rprsOgnzNo, @RequestBody List<Map<String, Object>> reqData) {

        //ResponseEntity<List<Map<String, Object>>> res;
        List<Map<String, Object>> res;
        res = null;
        // 단순응답
        // return new ResponseEntity<>("Resource created successfully", HttpStatus.CREATED);

        // 요청 바디에서 받은 User 객체를 처리
        // return new ResponseEntity<>(user, HttpStatus.OK);
        // return ResponseEntity.status(HttpStatus.OK).body(datas);

        // 요청 헤더와 바디를 처리
        // return ResponseEntity.status(HttpStatus.OK).header("Received-Header", headerValue).body("Request body: " + body);

        // return ResponseEntity.status(HttpStatus.OK).body(datas);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }


}
