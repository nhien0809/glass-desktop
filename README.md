# Nihongo Desk

Góc học tiếng Nhật JPD133 (Dekiru Nihongo bài 8–11) theo phong cách "desktop kính mờ" (glassmorphism), chuyển động bằng [GSAP](https://gsap.com/). Viết bằng HTML, CSS và JavaScript thuần.

Trang web: https://nhien0809.github.io/glass-desktop/

## Trang chủ

- Nền là ảnh phố Tokyo thật, panel kính mờ, nhân vật đứng giữa như ảnh mẫu.
- Đồng hồ chạy theo giờ thật (số lăn khi đổi).
- **今日の漢字**: ô tối nhỏ thay cho lịch. Mỗi ngày một chữ trong 41 chữ Hán: chữ to, âm Hán Việt, On · Kun, một từ ví dụ có furigana. Nút ‹ › để đổi chữ, nút con mắt để che đáp án tự kiểm tra (chạm vào phần mờ để xem). Rê chuột lên chữ để xem mẹo nhớ.
- Bốn thẻ bài 8, 9, 10, 11: bấm vào để mở sổ học lọc sẵn đúng bài.
- Trình phát nhạc YouTube: sẵn nhạc Quân A.P, dán thêm link của bạn (xem mục Nhạc).
- Thanh bên chỉ có icon (rê chuột để xem tên): Tra từ, Trang chủ, Chữ Hán, Bài đọc, Tranh, Luyện nói, bật/tắt nhân vật.
- Nhân vật chibi (Hana, Ken, Momo và chú chó Pochi) đi lại ở mép dưới màn hình.
- Dock công cụ: Mazii, Google Dịch, Jisho, NHK News Web Easy, YouTube, Spotify, có hiệu ứng phóng to khi rê chuột.

## Luyện nói

Bấm vào nhân vật ở giữa, nút "Luyện nói", nút micro ở thanh bên, hoặc một nhân vật chibi:

1. Nhân vật đọc to một câu hỏi tiếng Nhật của bài 8–11 (có furigana; nút "Nghĩa" và "Gợi ý" để xem nghĩa và mẫu câu trả lời).
2. Bấm micro để ghi âm câu trả lời, bấm lần nữa để dừng (tối đa 20 giây).
3. Nghe lại bản ghi, xem câu bạn nói (nếu trình duyệt nhận dạng được tiếng Nhật) và nhận xét: đúng ý / gần đúng / thử lại. Bấm "Câu mẫu" để nghe câu trả lời mẫu.

Chọn bài 8, 9, 10, 11 hoặc "Tất cả" ở góc trên. Mọi thứ chạy ngay trong trình duyệt (Web Speech API + MediaRecorder): không cần máy chủ, không tải bản ghi lên đâu cả. Nhận dạng giọng nói chạy tốt nhất trên Chrome và Edge; trình duyệt khác vẫn ghi âm và nghe lại được.

## Nhạc

- Sẵn 6 bài của Quân A.P: Bông Hoa Đẹp Nhất, Ai Là Người Thương Em, Có Ai Hẹn Hò Cùng Em Chưa, Lời Xin Lỗi Vụng Về, You Are My Crush, 3 Phải 6 Đừng.
- Bấm nút danh sách (hoặc ảnh bìa) để mở cửa sổ nhạc. Dán link YouTube vào ô rồi bấm "Thêm": nhận link bài hát (`youtube.com/watch?v=…`, `youtu.be/…`, Shorts) và link playlist (`…list=…`). Tên bài tự điền khi phát.
- Bài bạn thêm được lưu trong trình duyệt (localStorage), nằm trên đầu danh sách, bấm × để xoá. Có nút phát ngẫu nhiên, bấm thanh tiến độ để tua.
- Nhạc phát qua trình phát YouTube chính thức, nên video phải hiện trên màn hình (luật của YouTube): đóng cửa sổ nhạc thì nhạc tạm dừng. Video nào chủ kênh chặn nhúng sẽ được bỏ qua, chuyển sang bài tiếp.

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
- `assets/speak.js`: cửa sổ luyện nói (câu hỏi, giọng đọc, ghi âm, chấm).
- `assets/characters.js`: nhân vật chibi đi lại.
- `assets/music.js`: trình phát nhạc YouTube (danh sách mặc định, thêm link, lưu localStorage).
- `assets/hero.webp`: nhân vật ở giữa (ảnh nền trong suốt bạn gửi).
- `assets/kanji.json`: danh sách chữ Hán cho thẻ "Kanji hôm nay".

## Ghi công

- Ảnh nền: [Kate Kasiutich trên Unsplash](https://unsplash.com/photos/street-scene-with-tokyo-skytree-in-the-distance-y0h1pER2-_8) (Unsplash License).
- Nhân vật ở giữa lấy từ ảnh bạn gửi; đây là nhân vật anime có bản quyền của tác giả gốc.
- Icon thương hiệu: [Simple Icons](https://simpleicons.org/) (CC0), xem `assets/icons/SIMPLE-ICONS-LICENSE.md`.
- Nhạc: phát trực tiếp từ YouTube qua YouTube IFrame Player API; bản quyền thuộc Quân A.P và các chủ kênh.
- GSAP 3, tải từ cdnjs.
