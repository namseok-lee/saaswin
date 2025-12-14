"use client";
import { useState, useEffect } from "react";

// 캘린더 라이브러리
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import interactionPlugin from "@fullcalendar/interaction";
// 구글 api 사용


// 구글캘린더 api 연결
import axios from "axios";

import { fetcherPost } from "utils/axios";

export default function GoogleTest() {
  const [googleCalendar, setGoogleCalendar] = useState(false);
  const [googleCalendarData, setGoogleCalendarData] = useState<any[]>([]);
  const [dataList, setDataList] = useState<any[]>([]);

  // 언어 변경 임의
  const selectList = [
    { key: "KOR", value: "kr" },
    { key: "ENG", value: "en" },
    { key: "CHN", value: "zh" },
    { key: "JPN", value: "ja" },
  ];
  const [Selected, setSelected] = useState(selectList[0].value);

  // DB에서 가져온 연동 유무 확인
  useEffect(() => {
    setGoogleCalendar(false);

    // api연결
    const fetchGoogleCalendarEvents = async () => {
      const url =
        "https://www.googleapis.com/calendar/v3/calendars/windummy01%40gmail.com/events";
      const params = {
        key: "AIzaSyCn0JRpknSYMQ4iOcWfohGvWxD8faCXrA8",

        // 오늘로부터 현재 3개월 전, 미래는 상관없음 6월 1일 입력시 안 받아옴
        // timeMin: "2024-10-27T00:00:00+09:00",
        // timeMax: "2024-12-08T00:00:00+09:00",
        singleEvents: false,
        maxResults: 9999,
      };

      try {
        // GET 요청
        const response = await axios.get(url, { params });
        setGoogleCalendarData(response.data.items);
      } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
    };
    fetchGoogleCalendarEvents();
  }, []);

  useEffect(() => {
    if (googleCalendarData.length > 0) {
      const refinedData = googleCalendarData.map((item: any) => ({
        usre_no: "1234",
        ocrn_type: "01",
        crt_dt: item.created || "",
        calnd_id: item.id || "",
        ttl: item.summary || "",
        cn: "",
        schdl_bgng_ymd: formatDateToCompact(item.start?.date) || "",
        schdl_end_ymd: formatDateToCompact(item.end?.date) || "",
        creatr_eml: item.creator?.email || "",
        sys_col_info: {
          kind: item.kind || "",
          status: item.status || "",
          updated: item.updated || "",
        },
      }));
      setDataList(refinedData);
    }
  }, [googleCalendarData]);

  useEffect(() => {
    if (dataList.length > 0) {
      const baseURL = "http://localhost:9001";
      const url = `${baseURL}/api/google/calendar/insert`;

      // DB insert API 호출
      // fetcherPost([url, dataList]).then((response) => {
      //   console.log(response);
      // });
    }
  }, [dataList]);

  const handleSelect = (e: any) => {
    setSelected(e.target.value);
  };

  const handleGoogleCalendar = (e: any) => {
    setGoogleCalendar(!googleCalendar);

    // googleCalendar의 상태를 확인한다 true라면
    if (googleCalendar) {
      // 구글 api연결 후 연동
      // DB에 insert
    }
  };

  // 구글 캘린더 연결 유무 확인
  const calendarOptions = googleCalendar
    ? {
        googleCalendarApiKey: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY,
        events: {
          googleCalendarId: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID,
        },
      }
    : {};

  // 날짜 변환 함수
  const formatDateToCompact = (dateString: string) => {
    const parts = dateString.split("-");
    return parts.join("");
  };

  const [events, setEvents] = useState([
    { title: "Sample Event", date: "2024-11-28" },
  ]);

  const handleDateClick = (info: any) => {

    const title = prompt("Enter a title for your event:");
    if (title) {
      setEvents([
        ...events,
        { title, date: info.dateStr }, // 새로운 이벤트 추가
      ]);
    }
  
  
  };

  return (
    <div style={{ width: "50%", height: "50%" }}>
      <select onChange={handleSelect} value={Selected}>
        {selectList.map((item) => (
          <option value={item.value} key={item.key}>
            {item.key}
          </option>
        ))}
      </select>
      <hr />
      <p>
        Selected: <b>{Selected}</b>
      </p>

      <FullCalendar
        key={googleCalendar ? "withGoogleCalendar" : "withoutGoogleCalendar"}
        locale={Selected} // 필요에 따라 변경
        plugins={[dayGridPlugin, interactionPlugin, googleCalendarPlugin]}
        initialView="dayGridMonth"
        {...calendarOptions} // 조건부 속성 적용
        eventDisplay={"block"}
        eventTextColor={"#FFFFFF"}
        height={"660px"}
        // navLinks={true}
        // events={events}
        // dateClick={handleDateClick}
      />

      <button onClick={handleGoogleCalendar}>
        {googleCalendar ? "구글 캘린더 연동끊기" : "구글 캘린더 연동하기"}
      </button>
    </div>
  );
}
