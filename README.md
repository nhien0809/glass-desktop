# Nihongo Desk

Góc học tiếng Nhật JPD133 (Dekiru Nihongo bài 8–11) theo phong cách "desktop kính mờ" (glassmorphism), chuyển động bằng [GSAP](https://gsap.com/). Viết bằng HTML, CSS và JavaScript thuần.

Trang web: https://nhien0809.github.io/glass-desktop/

## Trang chủ

- Đồng hồ chạy theo giờ thật (số lăn khi đổi), ngày kiểu Việt và kiểu Nhật (11月16日（月）).
- Lịch tháng hiện tại với tên thứ bằng chữ Hán, hôm nay được gạch chân.
- **今日の漢字 · Kanji hôm nay**: mỗi ngày một chữ trong 41 chữ Hán, có âm Hán Việt, On, Kun, từ ví dụ có furigana và mẹo nhớ. Nút ‹ › để xem chữ khác, "Che đáp án" để tự kiểm tra.
- Bốn thẻ bài 8, 9, 10, 11: bấm vào để mở sổ học lọc sẵn đúng bài.
- Trình phát nhạc (play/pause, tiến độ, đĩa xoay).
- Thanh bên: mỗi nút là một từ tiếng Nhật đúng nghĩa kèm chú thích tiếng Việt: Tra từ, ホーム (Trang chủ), 漢字 (Chữ Hán), 読解 (Đọc hiểu), 絵 (Tranh), 人 (bật/tắt nhân vật).
- Nhân vật chibi tự vẽ (Hana, Ken, Momo và chú chó Pochi) đi lại ở mép dưới màn hình; bấm vào để nghe một câu tiếng Nhật của bài 8–11 có furigana và nghĩa.
- Dock công cụ: Mazii, Google Dịch, Jisho, NHK News Web Easy, YouTube, Spotify, có hiệu ứng phóng to khi rê chuột.

## Sổ học (`hoc/`)

- **Học chữ Hán**: 41 thẻ chữ Hán, lọc theo bài, chế độ tự kiểm tra.
- **Bài đọc**: 11 bài đọc hiểu (mỗi bài 5 chữ Hán + 5 từ katakana), bản dịch, câu hỏi và đáp án kèm ngữ pháp. Di chuột (hoặc chạm) vào chữ Hán / katakana trong bài để xem cách đọc, âm Hán Việt, On/Kun và nghĩa.
- **Tranh kiểm tra**: nhìn tranh trả lời câu hỏi, có gợi ý và đáp án.

## Chuyển động (GSAP)

- Timeline xuất hiện lần lượt cho panel, thanh bên, widget và dock.
- Dock phóng to kiểu macOS (`gsap.quickTo` + `gsap.utils.mapRange`), thẻ nhấc lên khi rê chuột.
- Thẻ và bài đọc hiện dần khi đổi tab hoặc đổi bộ lọc; đáp án trượt ra khi mở.
- Tôn trọng `prefers-reduced-motion` bằng `gsap.matchMedia()`.

## Chạy ở máy

```bash
python -m http.server 5173
```

Rồi mở http://localhost:5173.

## Tệp

- `index.html`, `style.css`, `main.js`: trang chủ.
- `hoc/index.html`, `hoc/study.css`, `hoc/study.js`: sổ học.
- `assets/glass-ui.js`: hàm GSAP dùng chung (dock, hover).
- `assets/kanji.json`: danh sách chữ Hán cho thẻ "Kanji hôm nay".

## Ghi công

- Icon thương hiệu: [Simple Icons](https://simpleicons.org/) (CC0), xem `assets/icons/SIMPLE-ICONS-LICENSE.md`.
- GSAP 3, tải từ cdnjs.
