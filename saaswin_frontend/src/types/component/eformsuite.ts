
// card 데이터 타입 정의
export interface CardData {
    length: number;
    slice(arg0: number, arg1: number): import("react").SetStateAction<CardData[]>;
    tmplt_id: any;
    thumbnail_file_mng_no?: string;
    tmplt_tit: string;
}
