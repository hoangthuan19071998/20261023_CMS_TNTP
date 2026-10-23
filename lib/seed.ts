import { PIPELINE, TRANSITIONS } from "./permissions";
import type { Article, Comment, LogEntry, StateId, Version } from "./types";

// Dữ liệu mẫu: 14 bài rải đều trên các trạng thái với nội dung chuẩn hóa,
// đảm bảo tính đồng nhất tuyệt đối giữa Nội dung, Trạng thái, Thông tin duyệt,
// Bình luận nội bộ, Lịch sử phiên bản và Sơ đồ quy trình.

const BASE = new Date("2026-10-23T09:00:00+07:00").getTime();

/** Trả về mốc thời gian lùi về quá khứ số giờ cho trước. */
function truoc(gio: number): string {
  return new Date(BASE - gio * 3600 * 1000).toISOString();
}

interface ArticleContent {
  sapo: string;
  doan: string[];
}

const NOI_DUNG_BAI: Record<string, ArticleContent> = {
  "TNTP-1041": {
    sapo: "Đề xuất mở rộng thêm 5 tuyến xe buýt điện kết nối các khu đô thị vệ tinh phía Tây và phía Đông với trung tâm thành phố giai đoạn 2026-2030.",
    doan: [
      "Tổng công ty Vận tải vừa trình UBND thành phố phương án phát triển mạng lưới giao thông công cộng xanh, trong đó ưu tiên mở rộng mạng lưới xe buýt điện tại các khu vực tập trung đông dân cư mới.",
      "Theo đề xuất, 5 tuyến buýt điện mới sẽ kết nối trực tiếp các khu đô thị lớn thuộc địa bàn Gia Lâm, Hoài Đức, Đông Anh với các ga đường sắt đô thị trọng điểm như ga Cát Linh và ga Nhổn.",
      "Dự kiến tổng mức đầu tư phương tiện khoảng 450 tỷ đồng, sử dụng nguồn vốn xã hội hóa của doanh nghiệp kết hợp chính sách trợ giá vận tải hành khách công cộng hiện hành của thành phố.",
      "Đại diện Sở Giao thông Vận tải cho biết thành phố đang khẩn trương phối hợp cùng các đơn vị điện lực để khảo sát, quy hoạch các trạm sạc nhanh công suất lớn tại đầu bến xe buýt.",
      "Nếu được phê duyệt trong quý IV/2026, tuyến buýt điện đầu tiên chạy thử nghiệm kết nối Vinhomes Ocean Park với ga Hà Nội sẽ chính thức lăn bánh vào đầu năm tới."
    ]
  },
  "TNTP-1042": {
    sapo: "Nhiều người trẻ thế hệ Gen Z rời văn phòng trở về các làng nghề truyền thống Bát Tràng và Vạn Phúc, mang theo tư duy thiết kế đương đại và thương mại số.",
    doan: [
      "Làng gốm cổ Bát Tràng những ngày cuối năm nhộn nhịp hơn với sự xuất hiện của những xưởng thiết kế gốm ứng dụng do các bạn trẻ tốt nghiệp ngành mỹ thuật công nghiệp làm chủ.",
      "Thay vì chỉ tập trung vào các sản phẩm thờ cúng hay gốm phong thủy theo lối mòn, thế hệ nghệ nhân trẻ mang đến các dòng sản phẩm gốm tối giản, mang hơi thở đương đại và màu men tự nhiên.",
      "Bằng việc ứng dụng mô hình bán hàng đa kênh trên các sàn thương mại điện tử quốc tế, nhiều xưởng gốm trẻ đã tiếp cận thành công thị trường Bắc Mỹ và châu Âu, doanh thu tăng trưởng ấn tượng.",
      "Nghệ nhân ưu tú Trần Văn Hưng nhận định: 'Sức sáng tạo và khả năng làm chủ công nghệ của người trẻ đã thổi luồng sinh khí mới vào kỹ nghệ ngàn năm của cha ông để lại.'",
      "Loạt bài phóng sự sẽ đi sâu tìm hiểu ba làng nghề tiêu biểu, ghi lại hành trình vượt qua định kiến để hồi sinh di sản truyền thống của những người trẻ tràn đầy nhiệt huyết."
    ]
  },
  "TNTP-1038": {
    sapo: "Giá sắt thép và xi măng xây dựng ghi nhận mức tăng 4-7% trong tháng 10 do nhu cầu đẩy nhanh tiến độ các công trình hạ tầng giao thông trọng điểm cuối năm.",
    doan: [
      "Sau quý III tương đối trầm lắng, thị trường vật liệu xây dựng tại khu vực miền Bắc bắt đầu bước vào chu kỳ tăng giá mới với sức tiêu thụ tăng mạnh từ các đại lý lớn.",
      "Khảo sát tại các nhà phân phối thép xây dựng Hòa Phát, Việt Ý cho thấy giá thép cuộn và thép cây đồng loạt tăng từ 400.000 đến 650.000 đồng/tấn so với thời điểm đầu tháng.",
      "Nguyên nhân chủ yếu xuất phát từ giá quặng sắt và than cốc nhập khẩu trên thị trường thế giới tăng 8%, cộng hưởng với áp lực giải ngân vốn đầu tư công cao điểm cuối năm.",
      "Hiệp hội Thép Việt Nam dự báo mặt bằng giá nguyên vật liệu xây dựng sẽ tiếp tục neo ở mức cao cho tới hết mùa thi công xây dựng đầu năm 2027.",
      "Trước biến động giá, nhiều nhà thầu xây lắp đang kiến nghị chủ đầu tư cho phép điều chỉnh đơn giá hợp đồng trọn gói để tránh nguy cơ thua lỗ kéo dài."
    ]
  },
  "TNTP-1035": {
    sapo: "Dù năm học mới đã bắt đầu hơn hai tháng, nhiều trường tiểu học tại vùng cao Tây Bắc vẫn phải xoay xở dạy ghép môn Tiếng Anh vì thiếu biên chế giáo viên chuyên trách.",
    doan: [
      "Tại huyện vùng cao Mù Cang Chải (Yên Bái), 12 trường tiểu học hiện chỉ có 5 giáo viên tiếng Anh cơ hữu, buộc các thầy cô phải liên tục di chuyển giữa các điểm trường lẻ cách nhau hàng chục cây số.",
      "Để bảo đảm chương trình giáo dục phổ thông mới cho học sinh lớp 3, nhiều trường buộc phải tổ chức lớp học trực tuyến qua màn hình tivi hoặc nhờ giáo viên môn Tin học hỗ trợ giảng dạy.",
      "Theo số liệu tổng hợp ban đầu, toàn vùng miền núi phía Bắc hiện còn thiếu hơn 500 giáo viên ngoại ngữ bậc tiểu học, trong đó các huyện vùng sâu, vùng xa có tỷ lệ thiếu hụt cao nhất.",
      "Hiệu trưởng một trường bán trú dân tộc chia sẻ: 'Mức phụ cấp thu hút hiện nay chưa đủ để các cử nhân sư phạm ngoại ngữ chấp nhận rời thành phố lên cắm bản nhiều năm liền.'",
      "Bài toán thiếu hụt giáo viên ngoại ngữ vùng đồng bào dân tộc thiểu số đòi hỏi chính sách tuyển dụng linh hoạt và cơ chế đãi ngộ nhà công vụ để giữ chân giáo viên lâu dài."
    ]
  },
  "TNTP-1030": {
    sapo: "Hội thảo chuyển đổi số báo chí chỉ ra rằng thay đổi tư duy và thói quen tác nghiệp thủ công của đội ngũ phóng viên, biên tập viên mới là thách thức cốt lõi.",
    doan: [
      "Sáng 22/10, tại Hà Nội, hội thảo về chuyển đổi số trong lĩnh vực báo chí đã thu hút hơn 200 đại biểu đến từ các cơ quan báo chí trung ương và địa phương trên toàn quốc.",
      "Theo báo cáo khảo sát được công bố tại hội thảo, tỷ lệ cơ quan báo chí đã triển khai tòa soạn hội tụ ở mức một phần ba, trong đó phần lớn tập trung ở các cơ quan báo chí có quy mô lớn.",
      "Đại diện ban tổ chức cho biết khó khăn lớn nhất không nằm ở hạ tầng công nghệ mà ở việc thay đổi quy trình làm việc, khi nhiều khâu biên tập và lưu trữ vẫn xử lý trên giấy.",
      "Phiên thảo luận buổi chiều tập trung vào bài toán tối ưu luồng quy trình: làm thế nào rút ngắn thời gian từ lúc phóng viên gửi bài đến khi duyệt xuất bản mà vẫn giữ đủ các lớp kiểm soát.",
      "Nhiều đại biểu đề xuất cần đẩy mạnh trang bị công cụ hỗ trợ thông minh cho phóng viên, đồng thời tích hợp chặt chẽ việc đo lường dữ liệu bạn đọc vào quy trình sản xuất tin bài."
    ]
  },
  "TNTP-1029": {
    sapo: "Dự án mở rộng đường ven sông Hồng dài hơn 10km sau một thập kỷ thi công dở dang đang đứng trước cơ hội tái khởi động nhờ quy hoạch phân khu đô thị sông Hồng được phê duyệt.",
    doan: [
      "Tuyến đường ven sông từng được kỳ vọng sẽ trở thành trục cảnh quan ven đô hiện đại, kết nối các cây cầu huyết mạch và mở ra không gian sinh thái cho người dân thủ đô.",
      "Tuy nhiên sau mười năm khởi công với ba lần điều chỉnh tổng mức đầu tư, tuyến đường vẫn ngổn ngang với những đoạn kè sông dở dang và mặt đường sỏi đá mấp mô.",
      "Nút thắt lớn nhất của dự án nằm ở khâu đền bù và tái định cư cho gần 800 hộ dân sinh sống lâu đời trong hành lang thoát lũ và đê điều phòng chống thiên tai.",
      "Theo thống kê mới nhất từ ban quản lý dự án, hiện công tác đo đạc địa chính đã đạt 92% khối lượng, các phương án tái định cư bằng căn hộ chung cư đang được lấy ý kiến đồng thuận.",
      "Chính quyền thành phố đặt mục tiêu tháo gỡ dứt điểm các vướng mắc mặt bằng sạch trong quý I/2027 để sớm đưa công trình vào khai thác phục vụ nhân dân."
    ]
  },
  "TNTP-1026": {
    sapo: "Trước các hàng rào kỹ thuật ngày càng khắt khe từ thị trường nhập khẩu, việc chuẩn hóa mã số vùng trồng và tem truy xuất nguồn gốc điện tử là điều kiện sống còn của nông sản Việt.",
    doan: [
      "Những lô hàng sầu riêng, thanh long và xoài xuất khẩu sang thị trường Đông Á và EU trong tháng 10 tiếp tục phải tuân thủ nghiêm ngặt các quy định về kiểm soát sinh vật gây hại.",
      "Thời gian qua, tình trạng mượn mã số vùng trồng và gian lận nhật ký canh tác đã khiến một số lô hàng bị cảnh báo tại cửa khẩu, ảnh hưởng đến thương hiệu nông sản Việt Nam.",
      "Bộ Nông nghiệp vừa phối hợp cùng các địa phương triển khai nền tảng cơ sở dữ liệu số quốc gia, tích hợp định vị vệ tinh và nhật ký điện tử cho từng hợp tác xã.",
      "Đại diện Hiệp hội Rau quả Việt Nam cho biết: 'Khi mã số vùng trồng được minh bạch bằng mã QR động, giá trị gia tăng của nông sản xuất khẩu đã tăng từ 15 đến 20%.'",
      "Doanh nghiệp và người nông dân cần liên kết chặt chẽ hơn trong chuỗi cung ứng khép kín để bảo đảm đáp ứng đầy đủ các tiêu chuẩn an toàn thực phẩm toàn cầu."
    ]
  },
  "TNTP-1022": {
    sapo: "Tổng hợp 23 điểm đen ngập úng nội thành trong mùa mưa năm 2026, phân tích nguyên nhân quá tải hạ tầng thoát nước và hướng dẫn tuyến tránh cho phương tiện.",
    doan: [
      "Những trận mưa lớn dồn dập kéo dài từ đầu tháng 10 đã khiến nhiều tuyến giao thông trọng điểm ngập sâu từ 30 đến 50cm, gây ùn tắc giao thông nghiêm trọng trong giờ cao điểm.",
      "Bản đồ infographic chi tiết hóa 23 điểm ngập úng thường xuyên thuộc lưu vực sông Tô Lịch, sông Nhuệ và sông Kim Ngưu, kèm theo độ sâu trung bình và thời gian nước rút ước tính.",
      "Nguyên nhân chính được xác định do hệ thống cống thoát nước ngầm đã cũ kỹ, kết hợp với các dự án hồ điều hòa và trạm bơm tiêu thoát nước trọng điểm chậm tiến độ.",
      "Các chuyên gia đô thị khuyến nghị người tham gia giao thông cần chủ động theo dõi ứng dụng cảnh báo ngập nước thời gian thực để lựa chọn lộ trình di chuyển an toàn.",
      "Thành phố đang khẩn trương đẩy nhanh thi công dự án trạm bơm Yên Nghĩa và nạo vét đồng bộ các trục tiêu thoát nước chính trước khi bước vào đợt mưa lớn tiếp theo."
    ]
  },
  "TNTP-1021": {
    sapo: "Sau một năm triển khai đề án phát triển thể chất học đường, các câu lạc bộ thể thao tự nguyện trong trường học đã tạo chuyển biến tích cực trong thói quen rèn luyện của học sinh.",
    doan: [
      "Khảo sát tại 50 trường THCS và THPT trên địa bàn thành phố cho thấy tỷ lệ học sinh tham gia luyện tập thể thao thường xuyên ngoài giờ học chính khóa đã tăng thêm 25%.",
      "Mô hình xã hội hóa sân bóng đá mini, nhà thi đấu bóng rổ và hồ bơi liên trường đã giúp giải quyết bài toán thiếu hụt diện tích sân chơi thể chất trong các trường nội thành.",
      "Các giải đấu phong trào thể thao học sinh được tổ chức bài bản, tạo sân chơi lành mạnh, giúp các em nâng cao thể lực và giảm đáng kể thời gian ngồi trước màn hình điện thoại.",
      "Tuy nhiên, đội ngũ giáo viên giáo dục thể chất ở nhiều trường vẫn còn mỏng, phương pháp huấn luyện kỹ năng chuyên sâu cho học sinh năng khiếu cần được bồi dưỡng thêm.",
      "Ngành giáo dục đang tiếp tục mở rộng mô hình liên kết với các liên đoàn thể thao để chuẩn hóa giáo trình huấn luyện thể chất trường học trong giai đoạn tiếp theo."
    ]
  },
  "TNTP-1018": {
    sapo: "Đêm trắng tuần tra giữa đại ngàn Tây Nguyên cùng lực lượng kiểm lâm túc trực ngăn ngừa lâm tặc và trực chiến bên các chòi quan sát canh lửa rừng mùa khô hanh.",
    doan: [
      "Bước vào mùa khô hanh tháng 10, cái nắng gắt như thiêu đốt thảm thực vật dưới tán rừng khộp Vườn quốc gia Yok Đôn, đặt công tác phòng chống cháy rừng vào tình trạng báo động cao nhất.",
      "Đội kiểm lâm cơ động gồm 8 chiến sĩ thay phiên nhau luân phiên tuần tra 24/24 giờ trên cung đường tuần tra rừng hiểm trở dài hơn 30 cây số giáp ranh khu vực biên giới.",
      "Những bữa cơm ăn vội giữa rừng già bằng lương khô và nước suối, đối mặt với hiểm nguy từ muỗi vắt và các nhóm đối tượng khai thác lâm sản trái phép trang bị vũ khí thô sơ.",
      "Trạm trưởng trạm kiểm lâm tâm sự: 'Giữ được màu xanh của tán rừng nguyên sinh không chỉ là trách nhiệm giữ gỗ mà là bảo vệ túi nước ngọt cho cả triệu bà con vùng hạ du.'",
      "Hành trình kiên cường của những người lính giữ rừng thầm lặng nơi tuyến đầu biên cương xứng đáng nhận được sự quan tâm đầu tư trang thiết bị bảo hộ xứng đáng hơn."
    ]
  },
  "TNTP-1015": {
    sapo: "Khi các khối cao ốc bê tông ngày càng ken đặc, cuộc tìm kiếm và giữ gìn những công viên cây xanh, hồ nước tự nhiên trở thành thước đo quan trọng cho chất lượng sống đô thị.",
    doan: [
      "Bình minh trên bán đảo Tây Hồ, hiếm hoi lắm người dân thành phố mới tìm thấy những khoảng không gian xanh mát tự nhiên còn sót lại giữa đô thị hóa chóng mặt.",
      "Theo số liệu quy hoạch, diện tích cây xanh công cộng trên đầu người của thủ đô hiện chỉ đạt xấp xỉ 2m², thấp hơn nhiều so với tiêu chuẩn đô thị loại đặc biệt (từ 7 đến 9m²/người).",
      "Nhiều dự án công viên cây xanh quy hoạch kéo dài hàng chục năm vẫn chưa thành hình, diện tích đất công viên bị lấn chiếm hoặc sử dụng sai mục đích làm bãi trông giữ xe.",
      "Để hiện thực hóa cam kết tăng trưởng xanh, chính quyền thành phố đang quyết liệt di dời các cơ sở sản xuất gây ô nhiễm ra ngoại thành, dành toàn bộ quỹ đất cho không gian công cộng.",
      "Phát triển bền vững đòi hỏi tầm nhìn dài hạn, coi cây xanh và mặt nước là hạ tầng sinh thái thiết yếu chứ không thể là phần diện tích tận dụng sau các dự án bất động sản."
    ]
  },
  "TNTP-1011": {
    sapo: "Gói tín dụng ưu đãi 120.000 tỷ đồng giải ngân còn chậm, quỹ đất 20% trong các dự án thương mại phân tán và thủ tục xét duyệt đối tượng mua nhà còn nhiều rào cản hành chính.",
    doan: [
      "Báo cáo giám sát chuyên đề về nhà ở xã hội chỉ ra rằng nguồn cung căn hộ giá rẻ dành cho người thu nhập thấp vẫn đang ở mức báo động đỏ, cung không đủ một phần mười cầu.",
      "Điểm nghẽn thứ nhất là tiêu chí xác nhận thu nhập cá nhân và điều kiện cư trú tại địa phương còn rườm rà, khiến nhiều công nhân lao động trực tiếp khó tiếp cận hồ sơ vay vốn.",
      "Điểm nghẽn thứ hai là quỹ đất 20% bắt buộc trong các khu đô thị thương mại thường bị chủ đầu tư chậm giải phóng mặt bằng, hoặc nằm ở các vị trí thiếu kết nối hạ tầng giao thông.",
      "Điểm nghẽn thứ ba là thủ tục thẩm định giá bán nhà ở xã hội kéo dài qua nhiều cấp sở ngành, làm tăng chi phí vốn và giảm động lực tham gia của các doanh nghiệp bất động sản uy tín.",
      "Các chuyên gia kiến nghị cần sớm thành lập Quỹ Phát triển nhà ở xã hội quốc gia và đơn giản hóa thủ tục hành chính theo hướng dịch vụ công trực tuyến để hỗ trợ người dân."
    ]
  },
  "TNTP-1004": {
    sapo: "Phiên bế mạc hội thảo chuyển đổi số báo chí khẳng định việc chuẩn hóa quy trình phân quyền và làm chủ nền tảng số là chìa khóa để nâng cao sức cạnh tranh báo chí hiện đại.",
    doan: [
      "Tại phiên bế mạc chiều 22/10, hơn 200 đại biểu cơ quan báo chí đã thông qua thông điệp chung về việc đẩy nhanh ứng dụng tòa soạn hội tụ trên nền tảng điện toán đám mây bảo mật cao.",
      "Các cơ quan báo chí tiên phong đã chia sẻ bài học kinh nghiệm: chuyển đổi số không phải là mua sắm phần mềm đắt tiền mà là tái cấu trúc toàn diện chuỗi sản xuất tin bài đa phương tiện.",
      "Nhiều mô hình biên tập số thông minh đã giúp rút ngắn tới 50% thời gian xử lý duyệt bài, đồng thời ngăn ngừa tối đa các sai sót biên tập nhờ cơ chế kiểm duyệt chặt chẽ nhiều lớp.",
      "Đại diện các cơ quan thông tấn kiến nghị cơ quan quản lý nhà nước sớm ban hành khung tiêu chuẩn kỹ thuật số chung để kết nối liên thông dữ liệu báo chí trên phạm vi toàn quốc.",
      "Bài viết đã được hoàn thiện, chốt duyệt và chính thức phát hành trên trang chủ báo điện tử, phục vụ đông đảo bạn đọc quan tâm đến tiến trình chuyển đổi số quốc gia."
    ]
  },
  "TNTP-0990": {
    sapo: "Số báo in đặc biệt chào mừng ngày Quốc khánh và tháng thanh niên lao động sáng tạo, tôn vinh 10 gương mặt kỹ sư, bác sĩ và công nhân trẻ tiêu biểu của đất nước.",
    doan: [
      "Ấn phẩm đặc biệt phát hành toàn quốc tháng 9/2026 giới thiệu chân dung 10 thanh niên trẻ đại diện cho tinh thần cống hiến, dám nghĩ dám làm trên nhiều lĩnh vực then chốt.",
      "Từ chàng kỹ sư trẻ nghiên cứu tối ưu hóa cánh tay robot tự động tại tổ hợp nhà máy công nghệ cao Bắc Ninh, đến nữ bác sĩ tình nguyện mang áo blouse trắng đến vùng biển đảo tiền tiêu.",
      "Mỗi câu chuyện là một minh chứng sống động cho ý chí vượt khó, khát khao vươn lên làm chủ khoa học công nghệ hiện đại và tinh thần phụng sự cộng đồng của thế hệ trẻ hôm nay.",
      "Các chuyên mục phỏng vấn chuyên sâu, phóng sự ảnh và bài xã luận được trình bày công phu, tạo nên bức tranh toàn cảnh rực rỡ sắc màu về tuổi trẻ Việt Nam trong thời đại mới.",
      "Ấn phẩm đã hoàn thành toàn bộ các khâu biên tập, chế bản, in ấn và nộp lưu chiểu Thư viện Quốc gia theo đúng quy định của Luật Xuất bản."
    ]
  }
};

interface SeedSpec {
  maBai: string;
  tieuDe: string;
  chuyenMuc: string;
  anPham: Article["anPham"];
  loai: Article["loai"];
  tacGia: string;
  trangThai: StateId;
  gioTrongTrangThai: number;
  fileBanBong?: string | null;
  daKySo?: boolean;
  lyDoGanNhat?: string | null;
  duongDi?: StateId[];
}

const SPECS: SeedSpec[] = [
  { maBai: "TNTP-1041", tieuDe: "Đề xuất mở rộng tuyến buýt điện nội đô", chuyenMuc: "Đô thị", anPham: "bao_dien_tu", loai: "tin", tacGia: "Nguyễn Thị Mai", trangThai: "S0", gioTrongTrangThai: 30 },
  { maBai: "TNTP-1042", tieuDe: "Loạt bài: Người trẻ và nghề thủ công truyền thống", chuyenMuc: "Văn hóa", anPham: "ca_hai", loai: "longform", tacGia: "Nguyễn Thị Mai", trangThai: "S0", gioTrongTrangThai: 6 },
  { maBai: "TNTP-1038", tieuDe: "Giá vật liệu xây dựng tăng trở lại sau ba tháng", chuyenMuc: "Kinh tế", anPham: "bao_dien_tu", loai: "bai", tacGia: "Trần Quốc Bảo", trangThai: "S1", gioTrongTrangThai: 20 },
  { maBai: "TNTP-1035", tieuDe: "Trường học vùng cao xoay xở với thiếu giáo viên tiếng Anh", chuyenMuc: "Giáo dục", anPham: "ca_hai", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S1", gioTrongTrangThai: 52, lyDoGanNhat: "Cần bổ sung số liệu cụ thể của ba tỉnh và trích dẫn từ Sở Giáo dục.", duongDi: ["S0", "S1", "S2", "S1"] },
  { maBai: "TNTP-1030", tieuDe: "Chuyển đổi số báo chí: công nghệ không phải rào cản lớn nhất", chuyenMuc: "Thời sự", anPham: "ca_hai", loai: "bai", tacGia: "Trần Quốc Bảo", trangThai: "S2", gioTrongTrangThai: 4 },
  { maBai: "TNTP-1029", tieuDe: "Hồ sơ: Mười năm một con đường ven sông", chuyenMuc: "Phóng sự", anPham: "bao_in", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S2", gioTrongTrangThai: 19 },
  { maBai: "TNTP-1026", tieuDe: "Nông sản xuất khẩu và bài toán truy xuất nguồn gốc", chuyenMuc: "Kinh tế", anPham: "ca_hai", loai: "bai", tacGia: "Trần Quốc Bảo", trangThai: "S3", gioTrongTrangThai: 3 },
  { maBai: "TNTP-1022", tieuDe: "Infographic: Bản đồ ngập úng nội thành mùa mưa 2026", chuyenMuc: "Đô thị", anPham: "bao_dien_tu", loai: "infographic", tacGia: "Nguyễn Thị Mai", trangThai: "S4", gioTrongTrangThai: 9 },
  { maBai: "TNTP-1021", tieuDe: "Trang chuyên đề: Thể thao học đường sau một năm", chuyenMuc: "Thể thao", anPham: "bao_in", loai: "bai", tacGia: "Trần Quốc Bảo", trangThai: "S4", gioTrongTrangThai: 21, fileBanBong: null },
  { maBai: "TNTP-1018", tieuDe: "Ký sự: Những người giữ rừng mùa khô", chuyenMuc: "Phóng sự", anPham: "bao_in", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S5", gioTrongTrangThai: 2, fileBanBong: "TNTP-1018_banbong_v3.pdf" },
  { maBai: "TNTP-1015", tieuDe: "Longform: Thành phố và những khoảng xanh còn lại", chuyenMuc: "Đô thị", anPham: "bao_dien_tu", loai: "longform", tacGia: "Trần Quốc Bảo", trangThai: "S5", gioTrongTrangThai: 8, fileBanBong: "TNTP-1015_preview_web.html" },
  { maBai: "TNTP-1011", tieuDe: "Chính sách hỗ trợ nhà ở xã hội: ba điểm nghẽn", chuyenMuc: "Thời sự", anPham: "ca_hai", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S6", gioTrongTrangThai: 1, fileBanBong: "TNTP-1011_banbong_v2.pdf" },
  { maBai: "TNTP-1004", tieuDe: "Hội thảo chuyển đổi số: tòa soạn hội tụ vẫn còn chậm", chuyenMuc: "Thời sự", anPham: "bao_dien_tu", loai: "tin", tacGia: "Trần Quốc Bảo", trangThai: "S7", gioTrongTrangThai: 26, fileBanBong: "TNTP-1004_final.pdf", daKySo: true },
  { maBai: "TNTP-0990", tieuDe: "Số đặc biệt tháng 9: Chân dung người lao động trẻ", chuyenMuc: "Văn hóa", anPham: "bao_in", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S8", gioTrongTrangThai: 500, fileBanBong: "TNTP-0990_luuchieu.pdf", daKySo: true },
];

function nhanChuyen(tu: StateId, den: StateId): string {
  const tien = TRANSITIONS.find((t) => t.tu === tu && t.den === den && t.kieu === "tien");
  if (tien) return tien.nhan;
  const lui = TRANSITIONS.find((t) => t.tu === tu && t.den === den);
  return lui ? lui.nhan : "Chuyển bước";
}

interface ArticlePackage {
  article: Article;
  logs: LogEntry[];
}

/**
 * Xây dựng trọn gói một bài viết mẫu và toàn bộ nhật ký kiểm toán đi kèm.
 * Đảm bảo:
 * 1. Nội dung văn bản gắn chặt chẽ với tiêu đề, thể loại và chuyên mục.
 * 2. Phóng viên bấm gửi biên tập luôn khớp chính xác với `s.tacGia`.
 * 3. Mọi mốc thời gian tuyệt đối tuân theo thứ tự biên niên tăng dần.
 * 4. Bình luận nội bộ tương ứng chuẩn xác với từng đoạn và từng khâu.
 */

function taoSnapshotsChoBai(s: SeedSpec, nd: { sapo: string; doan: string[] }) {
  // Bản thảo v1 của Phóng viên (chưa biên tập)
  const v1TieuDe = s.tieuDe.includes(':') 
    ? s.tieuDe.replace(':', ' - Dự thảo:') 
    : s.tieuDe + ' (Bản thảo sơ bộ)';
  const v1Sapo = 'Theo thông tin ban đầu ghi nhận, ' + nd.sapo.charAt(0).toLowerCase() + nd.sapo.slice(1);
  const v1Doan = nd.doan.map((d, i) => {
    if (i === 0) {
      return d.replace('Sáng 22/10', 'Vào sáng ngày 22/10 vừa qua')
              .replace('200 đại biểu', 'hơn hai trăm đại biểu và khách mời')
              .replace('Bình minh trên', 'Vào lúc bình minh trên');
    }
    if (i === 1) {
      return d.replace('ở mức một phần ba', 'khoảng 30% đến 35%')
              .replace('Báo cáo giám sát', 'Theo tài liệu báo cáo giám sát');
    }
    return d;
  });

  // Bản v2 sau khi BTV biên tập (chuẩn hóa tên riêng, rút gọn sa pô)
  const v2TieuDe = s.tieuDe;
  const v2Sapo = nd.sapo;
  const v2Doan = [...nd.doan];

  // Bản v3 sau khi TKTS chốt (hoàn thiện văn phong, kiểm tra câu kết)
  const v3TieuDe = s.tieuDe;
  const v3Sapo = nd.sapo;
  const v3Doan = nd.doan.map((d, i) => {
    if (i === nd.doan.length - 1) {
      return d.endsWith('.') ? d.slice(0, -1) + ', đảm bảo tiến độ và chất lượng đề ra.' : d;
    }
    return d;
  });

  return {
    v1: { tieuDe: v1TieuDe, sapo: v1Sapo, doan: v1Doan },
    v2: { tieuDe: v2TieuDe, sapo: v2Sapo, doan: v2Doan },
    v3: { tieuDe: v3TieuDe, sapo: v3Sapo, doan: v3Doan },
  };
}

function taoBaiMau(s: SeedSpec, idx: number): ArticlePackage {
  const baiId = "bai-" + (idx + 1);
  const nd = NOI_DUNG_BAI[s.maBai] ?? {
    sapo: "Bản tóm tắt mô phỏng cho bài " + s.maBai + ".",
    doan: [s.tieuDe + " — nội dung bài viết mô phỏng."]
  };

  const logs: LogEntry[] = [];
  const phienBan: Version[] = [];
  const binhLuan: Comment[] = [];
  const snapshots = taoSnapshotsChoBai(s, nd);

  // =========================================================================
  // TRƯỜNG HỢP 1: BÀI Ở S0 (Đề tài chưa duyệt)
  // =========================================================================
  if (s.trangThai === "S0") {
    const taoLuc = truoc(s.gioTrongTrangThai + 8);
    const v1Time = truoc(s.gioTrongTrangThai + 6);
    const v1: Version = {
      id: `${baiId}-v1`,
      thoiDiem: v1Time,
      tacGia: "PV",
      tenNguoi: s.tacGia,
      ghiChu: "Đề xuất đề tài & đề cương sơ bộ",
      soTuThayDoi: 120,
      snapshot: snapshots.v1,
    };
    phienBan.push(v1);

    logs.push({
      id: `${baiId}-log-pb-1`,
      thoiDiem: v1Time,
      vaiTro: "PV",
      tenNguoi: s.tacGia,
      hanhDong: "Đăng ký đề tài",
      baiId,
      chiTiet: "Đăng ký đề tài & đề cương sơ bộ",
      phienBan: v1.id,
    });

    return {
      article: {
        id: baiId,
        maBai: s.maBai,
        tieuDe: s.tieuDe,
        sapo: nd.sapo,
        doan: nd.doan,
        chuyenMuc: s.chuyenMuc,
        anPham: s.anPham,
        loai: s.loai,
        tacGia: s.tacGia,
        trangThai: s.trangThai,
        vaoTrangThaiLuc: truoc(s.gioTrongTrangThai),
        taoLuc,
        phienBan,
        binhLuan,
        fileBanBong: null,
        daKySo: false,
        lyDoGanNhat: null,
      },
      logs,
    };
  }

  // =========================================================================
  // TRƯỜNG HỢP 2: BÀI S1 BỊ TRẢ LẠI (bai-4: S0 -> S1 -> S2 -> S1)
  // =========================================================================
  if (s.maBai === "TNTP-1035") {
    const taoLuc = truoc(96);
    const t_s0s1 = truoc(88);
    const t_v1 = truoc(80);
    const t_s1s2 = truoc(72);
    const t_c1 = truoc(60);
    const t_s2s1 = truoc(52);

    phienBan.push({
      id: `${baiId}-v1`,
      thoiDiem: t_v1,
      tacGia: "PV",
      tenNguoi: s.tacGia,
      ghiChu: "Bản viết đầu tiên",
      soTuThayDoi: 820,
      snapshot: snapshots.v1,
    });

    binhLuan.push({
      id: `${baiId}-c1`,
      thoiDiem: t_c1,
      tacGia: "BTV",
      tenNguoi: "Phạm Thu Hà",
      noiDung: "Đoạn 2 cần bổ sung số liệu cụ thể của ba tỉnh Sơn La, Điện Biên, Lai Châu và trích dẫn ý kiến phản hồi từ Sở Giáo dục như đã trao đổi khi trả bài.",
      ganThe: "PV",
      doanSo: 2,
      daXuLy: false,
    });

    // Logs theo trình tự
    logs.push({
      id: `${baiId}-log-pb-1`,
      thoiDiem: taoLuc,
      vaiTro: "PV",
      tenNguoi: s.tacGia,
      hanhDong: "Đăng ký đề tài",
      baiId,
      chiTiet: "Đề xuất đề tài: Trường học vùng cao xoay xở với thiếu giáo viên tiếng Anh",
    });

    logs.push({
      id: `${baiId}-log-trans-1`,
      thoiDiem: t_s0s1,
      vaiTro: "BTV",
      tenNguoi: "Phạm Thu Hà",
      hanhDong: nhanChuyen("S0", "S1"),
      baiId,
      chiTiet: 'Ghi chú: "Đề tài rất thiết thực, triển khai ngay trong tuần này."',
      tu: "S0",
      den: "S1",
      ghiChu: "Đề tài rất thiết thực, triển khai ngay trong tuần này.",
    });

    logs.push({
      id: `${baiId}-log-pb-2`,
      thoiDiem: t_v1,
      vaiTro: "PV",
      tenNguoi: s.tacGia,
      hanhDong: "Tạo bản thảo",
      baiId,
      chiTiet: "Bản viết đầu tiên",
      phienBan: `${baiId}-v1`,
    });

    logs.push({
      id: `${baiId}-log-trans-2`,
      thoiDiem: t_s1s2,
      vaiTro: "PV",
      tenNguoi: s.tacGia,
      hanhDong: nhanChuyen("S1", "S2"),
      baiId,
      chiTiet: 'Ghi chú: "Nhờ anh chị biên tập xem giúp em ạ."',
      tu: "S1",
      den: "S2",
      ghiChu: "Nhờ anh chị biên tập xem giúp em ạ.",
    });

    logs.push({
      id: `${baiId}-log-trans-3`,
      thoiDiem: t_s2s1,
      vaiTro: "BTV",
      tenNguoi: "Phạm Thu Hà",
      hanhDong: nhanChuyen("S2", "S1"),
      baiId,
      chiTiet: `Lý do: "${s.lyDoGanNhat}"`,
      tu: "S2",
      den: "S1",
      ghiChu: s.lyDoGanNhat,
    });

    return {
      article: {
        id: baiId,
        maBai: s.maBai,
        tieuDe: s.tieuDe,
        sapo: nd.sapo,
        doan: nd.doan,
        chuyenMuc: s.chuyenMuc,
        anPham: s.anPham,
        loai: s.loai,
        tacGia: s.tacGia,
        trangThai: s.trangThai,
        vaoTrangThaiLuc: t_s2s1,
        taoLuc,
        phienBan,
        binhLuan,
        fileBanBong: null,
        daKySo: false,
        lyDoGanNhat: s.lyDoGanNhat ?? null,
      },
      logs,
    };
  }

  // =========================================================================
  // TRƯỜNG HỢP 3: CÁC BÀI ĐI THEO ĐƯỜNG ỐNG CHÍNH (S1 -> S8)
  // =========================================================================
  const currState = s.trangThai;
  const currIdx = PIPELINE.indexOf(currState);

  // Tính toán khoảng thời gian lùi về quá khứ sao cho:
  // H_start > H_s0s1 > H_v1 > H_s1s2 > H_c1 > H_v2 > H_s2s3 > H_v3 > H_c2 > H_s3s4 > H_file > H_s4s5 > H_s5s6 > H_s6s7 > H_c3 > H_s7s8
  const h_cur = s.gioTrongTrangThai;
  const span = currState === "S8" ? 60 : Math.max(36, currIdx * 7);
  const h_start = h_cur + span;

  // Chia nhỏ span thành các mốc thời gian đều đặn (step nhỏ bảo đảm không bao giờ trùng hoặc đảo ngược)
  // Ta có tối đa 14 mốc sự kiện
  const step = span / 15;
  const timeAt = (stage: number) => truoc(h_start - stage * step);

  const taoLuc = truoc(h_start + 4);
  const t_s0s1 = timeAt(1);
  const t_v1 = timeAt(2);
  const t_s1s2 = timeAt(3);
  const t_c1 = timeAt(4);
  const t_v2 = timeAt(5);
  const t_s2s3 = timeAt(6);
  const t_v3 = timeAt(7);
  const t_c2 = timeAt(8);
  const t_s3s4 = timeAt(9);
  const t_file = timeAt(10);
  const t_s4s5 = timeAt(11);
  const t_s5s6 = timeAt(12);
  const t_s6s7 = timeAt(13);
  const t_c3 = timeAt(13.5);
  const t_s7s8 = timeAt(14);

  // 1. Giai đoạn S0 -> S1 (Duyệt đề tài & tạo v1)
  logs.push({
    id: `${baiId}-log-pb-0`,
    thoiDiem: taoLuc,
    vaiTro: "PV",
    tenNguoi: s.tacGia,
    hanhDong: "Đăng ký đề tài",
    baiId,
    chiTiet: `Đề xuất đề tài: ${s.tieuDe}`,
  });

  logs.push({
    id: `${baiId}-log-trans-s0s1`,
    thoiDiem: t_s0s1,
    vaiTro: "BTV",
    tenNguoi: "Phạm Thu Hà",
    hanhDong: nhanChuyen("S0", "S1"),
    baiId,
    chiTiet: 'Ghi chú: "Đề tài rõ ràng, triển khai ngay trong tuần này."',
    tu: "S0",
    den: "S1",
    ghiChu: "Đề tài rõ ràng, triển khai ngay trong tuần này.",
  });

  phienBan.push({
    id: `${baiId}-v1`,
    thoiDiem: t_v1,
    tacGia: "PV",
    tenNguoi: s.tacGia,
    ghiChu: "Bản viết đầu tiên",
    soTuThayDoi: 820,
    snapshot: snapshots.v1,
  });

  logs.push({
    id: `${baiId}-log-pb-1`,
    thoiDiem: t_v1,
    vaiTro: "PV",
    tenNguoi: s.tacGia,
    hanhDong: "Tạo bản thảo",
    baiId,
    chiTiet: "Bản viết đầu tiên",
    phienBan: `${baiId}-v1`,
  });

  let vaoTrangThaiLuc = t_s0s1;

  // 2. Giai đoạn S1 -> S2 (Gửi biên tập)
  if (currIdx >= PIPELINE.indexOf("S2")) {
    logs.push({
      id: `${baiId}-log-trans-s1s2`,
      thoiDiem: t_s1s2,
      vaiTro: "PV",
      tenNguoi: s.tacGia, // ĐÚNG TÁC GIẢ BÀI VIẾT
      hanhDong: nhanChuyen("S1", "S2"),
      baiId,
      chiTiet: 'Ghi chú: "Nhờ anh chị biên tập xem giúp em ạ."',
      tu: "S1",
      den: "S2",
      ghiChu: "Nhờ anh chị biên tập xem giúp em ạ.",
    });
    vaoTrangThaiLuc = t_s1s2;

    // Bình luận c1 từ BTV
    const commentC1 = layBinhLuanBTV(s.maBai, baiId, t_c1, currState !== "S2");
    binhLuan.push(commentC1);

    // Phiên bản v2 từ BTV
    phienBan.push({
      id: `${baiId}-v2`,
      thoiDiem: t_v2,
      tacGia: "BTV",
      tenNguoi: "Phạm Thu Hà",
      ghiChu: "Biên tập: rút gọn sa pô, sửa 4 lỗi chính tả, chuẩn hóa tên riêng",
      soTuThayDoi: 96,
      snapshot: snapshots.v2,
    });

    logs.push({
      id: `${baiId}-log-pb-2`,
      thoiDiem: t_v2,
      vaiTro: "BTV",
      tenNguoi: "Phạm Thu Hà",
      hanhDong: "Sửa nội dung",
      baiId,
      chiTiet: "Biên tập: rút gọn sa pô, sửa 4 lỗi chính tả, chuẩn hóa tên riêng",
      phienBan: `${baiId}-v2`,
    });
  }

  // 3. Giai đoạn S2 -> S3 (Duyệt & chuyển TKTS)
  if (currIdx >= PIPELINE.indexOf("S3")) {
    logs.push({
      id: `${baiId}-log-trans-s2s3`,
      thoiDiem: t_s2s3,
      vaiTro: "BTV",
      tenNguoi: "Phạm Thu Hà",
      hanhDong: nhanChuyen("S2", "S3"),
      baiId,
      chiTiet: 'Ghi chú: "Đã rút gọn sa pô và chuẩn hóa tên riêng, chuyển Thư ký tòa soạn."',
      tu: "S2",
      den: "S3",
      ghiChu: "Đã rút gọn sa pô và chuẩn hóa tên riêng, chuyển Thư ký tòa soạn.",
    });
    vaoTrangThaiLuc = t_s2s3;
  }

  // 4. Giai đoạn S3 -> S4 (Chốt nội dung & khóa văn bản)
  if (currIdx >= PIPELINE.indexOf("S4")) {
    phienBan.push({
      id: `${baiId}-v3`,
      thoiDiem: t_v3,
      tacGia: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      ghiChu: "Chốt nội dung, khóa văn bản trước khi chuyển trình bày",
      soTuThayDoi: 23,
      snapshot: snapshots.v3,
    });

    logs.push({
      id: `${baiId}-log-pb-3`,
      thoiDiem: t_v3,
      vaiTro: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      hanhDong: "Sửa nội dung",
      baiId,
      chiTiet: "Chốt nội dung, khóa văn bản trước khi chuyển trình bày",
      phienBan: `${baiId}-v3`,
    });

    const commentC2 = layBinhLuanTKTS(s, baiId, t_c2, currIdx >= PIPELINE.indexOf("S5"));
    binhLuan.push(commentC2);

    logs.push({
      id: `${baiId}-log-trans-s3s4`,
      thoiDiem: t_s3s4,
      vaiTro: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      hanhDong: nhanChuyen("S3", "S4"),
      baiId,
      chiTiet: 'Ghi chú: "Nội dung đạt, khóa văn bản và chuyển sang trình bày."',
      tu: "S3",
      den: "S4",
      ghiChu: "Nội dung đạt, khóa văn bản và chuyển sang trình bày.",
    });
    vaoTrangThaiLuc = t_s3s4;
  }

  // 5. Giai đoạn S4 -> S5 (Gửi bản bông)
  if (currIdx >= PIPELINE.indexOf("S5")) {
    if (s.fileBanBong) {
      logs.push({
        id: `${baiId}-log-file`,
        thoiDiem: t_file,
        vaiTro: "HOA_SI",
        tenNguoi: "Vũ Hoàng Nam",
        hanhDong: "Tải lên bản bông",
        baiId,
        chiTiet: "Thêm tệp đính kèm " + s.fileBanBong,
      });
    }

    logs.push({
      id: `${baiId}-log-trans-s4s5`,
      thoiDiem: t_s4s5,
      vaiTro: "HOA_SI",
      tenNguoi: "Vũ Hoàng Nam",
      hanhDong: nhanChuyen("S4", "S5"),
      baiId,
      chiTiet: 'Ghi chú: "Đã hoàn thành thiết kế dàn trang, gửi bản bông soát duyệt."',
      tu: "S4",
      den: "S5",
      ghiChu: "Đã hoàn thành thiết kế dàn trang, gửi bản bông soát duyệt.",
    });
    vaoTrangThaiLuc = t_s4s5;
  }

  // 6. Giai đoạn S5 -> S6 (Trình duyệt)
  if (currIdx >= PIPELINE.indexOf("S6")) {
    logs.push({
      id: `${baiId}-log-trans-s5s6`,
      thoiDiem: t_s5s6,
      vaiTro: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      hanhDong: nhanChuyen("S5", "S6"),
      baiId,
      chiTiet: 'Ghi chú: "Bản bông đạt, trình duyệt xuất bản."',
      tu: "S5",
      den: "S6",
      ghiChu: "Bản bông đạt, trình duyệt xuất bản.",
    });
    vaoTrangThaiLuc = t_s5s6;
  }

  // 7. Giai đoạn S6 -> S7 (Ký số & duyệt xuất bản)
  if (currIdx >= PIPELINE.indexOf("S7")) {
    logs.push({
      id: `${baiId}-log-trans-s6s7`,
      thoiDiem: t_s6s7,
      vaiTro: "TBT",
      tenNguoi: "Hoàng Anh Tuấn",
      hanhDong: nhanChuyen("S6", "S7"),
      baiId,
      chiTiet: 'Ghi chú: "Đồng ý xuất bản, đã ký số."',
      tu: "S6",
      den: "S7",
      ghiChu: "Đồng ý xuất bản, đã ký số.",
    });
    vaoTrangThaiLuc = t_s6s7;

    const noiDungXuatBan = s.anPham === "bao_in"
      ? "Ấn phẩm đã hoàn tất in ấn và phát hành trên toàn quốc."
      : "Bài đã lên trang chủ lúc 7h00, đã kiểm tra hiển thị trên di động.";

    binhLuan.push({
      id: `${baiId}-c3`,
      thoiDiem: t_c3,
      tacGia: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      noiDung: noiDungXuatBan,
      ganThe: null,
      doanSo: null,
      daXuLy: true,
    });
  }

  // 8. Giai đoạn S7 -> S8 (Đưa vào lưu trữ / lưu chiểu)
  if (currIdx >= PIPELINE.indexOf("S8")) {
    logs.push({
      id: `${baiId}-log-trans-s7s8`,
      thoiDiem: t_s7s8,
      vaiTro: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      hanhDong: nhanChuyen("S7", "S8"),
      baiId,
      chiTiet: 'Ghi chú: "Đóng gói lưu chiểu theo quy định."',
      tu: "S7",
      den: "S8",
      ghiChu: "Đóng gói lưu chiểu theo quy định.",
    });
    vaoTrangThaiLuc = t_s7s8;
  }

  return {
    article: {
      id: baiId,
      maBai: s.maBai,
      tieuDe: phienBan[phienBan.length - 1]?.snapshot?.tieuDe ?? s.tieuDe,
      sapo: phienBan[phienBan.length - 1]?.snapshot?.sapo ?? nd.sapo,
      doan: phienBan[phienBan.length - 1]?.snapshot?.doan ?? nd.doan,
      chuyenMuc: s.chuyenMuc,
      anPham: s.anPham,
      loai: s.loai,
      tacGia: s.tacGia,
      trangThai: s.trangThai,
      vaoTrangThaiLuc,
      taoLuc,
      phienBan,
      binhLuan,
      fileBanBong: s.fileBanBong ?? null,
      daKySo: s.daKySo ?? false,
      lyDoGanNhat: s.lyDoGanNhat ?? null,
    },
    logs,
  };
}

function layBinhLuanBTV(maBai: string, baiId: string, thoiDiem: string, daXuLy: boolean): Comment {
  let noiDung = "Cần kiểm tra kỹ lại số liệu và nguồn trích dẫn trước khi chuyển Thư ký tòa soạn.";
  let doanSo: number | null = 1;

  if (maBai === "TNTP-1030") {
    noiDung = "Đoạn 1 cần trích dẫn rõ nguồn báo cáo khảo sát từ Cục Báo chí hay Viện Đào tạo Báo chí.";
    doanSo = 1;
  } else if (maBai === "TNTP-1029") {
    noiDung = "Đoạn 3 cần đối chiếu số liệu diện tích thu hồi đất với hồ sơ quy hoạch đê điều của Bộ Nông nghiệp.";
    doanSo = 3;
  } else if (maBai === "TNTP-1026") {
    noiDung = "Đoạn 2 cần làm rõ mã số vùng trồng cấp cho hợp tác xã hay từng hộ xã viên để doanh nghiệp tiện đối chiếu.";
    doanSo = 2;
  } else if (maBai === "TNTP-1022") {
    noiDung = "Đoạn 1 đã chuẩn hóa danh mục 23 điểm đen ngập úng nội thành, số liệu đạt yêu cầu.";
    doanSo = 1;
  } else if (maBai === "TNTP-1021") {
    noiDung = "Đã kiểm tra số liệu khảo sát 50 trường học ở đoạn 0, thông tin chính xác.";
    doanSo = 0;
  } else if (maBai === "TNTP-1018") {
    noiDung = "Ký sự viết rất chân thực và có cảm xúc, đã gọt giũa câu từ ở đoạn 2 để tăng tính văn học.";
    doanSo = 2;
  } else if (maBai === "TNTP-1015") {
    noiDung = "Đoạn 1 số liệu diện tích cây xanh 2m²/người đã đối chiếu đúng quy chuẩn kiến trúc cảnh quan.";
    doanSo = 1;
  } else if (maBai === "TNTP-1011") {
    noiDung = "Nội dung phân tích 3 điểm nghẽn rất sắc bén, đã bổ sung số liệu giải ngân gói 120 nghìn tỷ ở đoạn 0.";
    doanSo = 0;
  } else if (maBai === "TNTP-1004") {
    noiDung = "Tin nhanh bế mạc hội thảo, đã biên tập rút gọn phù hợp đọc nhanh trên báo điện tử.";
    doanSo = null;
  } else if (maBai === "TNTP-0990") {
    noiDung = "Loạt bài 10 tấm gương thanh niên tiêu biểu rất công phu, chuẩn bị chu đáo cho số báo đặc biệt tháng 9.";
    doanSo = null;
  }

  return {
    id: `${baiId}-c1`,
    thoiDiem,
    tacGia: "BTV",
    tenNguoi: "Phạm Thu Hà",
    noiDung,
    ganThe: daXuLy ? null : "PV",
    doanSo,
    daXuLy,
  };
}

function layBinhLuanTKTS(s: SeedSpec, baiId: string, thoiDiem: string, daXuLy: boolean): Comment {
  let noiDung = "Thiết kế trình bày bám sát quy chuẩn nhận diện thương hiệu của tòa soạn.";

  if (s.loai === "infographic") {
    noiDung = "Bản đồ infographic thiết kế theo định dạng dọc 9:16 cho di động, màu sắc phân cấp độ ngập rõ ràng từ vàng đến đỏ thẫm.";
  } else if (s.anPham === "bao_in") {
    if (s.maBai === "TNTP-1018") {
      noiDung = "Trang ảnh phóng sự dàn tràn lề báo in, ảnh mở bài dùng khổ ngang 4 cột tạo chiều sâu đại ngàn.";
    } else {
      noiDung = "Dàn 3 cột trang đôi báo in, chừa chỗ cho tít chạy hai dòng và box dữ liệu thống kê.";
    }
  } else {
    noiDung = "Ảnh mở bài cắt theo tỷ lệ 16:9, chừa chỗ cho tít chạy hai dòng trên nền hiệu ứng chuyển mờ.";
  }

  return {
    id: `${baiId}-c2`,
    thoiDiem,
    tacGia: "TKTS",
    tenNguoi: "Đỗ Minh Khoa",
    noiDung,
    ganThe: "HOA_SI",
    doanSo: null,
    daXuLy,
  };
}

// Bộ nhớ cache tạm thời để taoDuLieuMau và taoNhatKyMau cùng chia sẻ một nguồn sinh duy nhất
let CACHED_PACKAGES: ArticlePackage[] | null = null;

function layTatCaGoiBai(): ArticlePackage[] {
  if (!CACHED_PACKAGES) {
    CACHED_PACKAGES = SPECS.map((s, idx) => taoBaiMau(s, idx));
  }
  return CACHED_PACKAGES;
}

export function taoDuLieuMau(): Article[] {
  // Luôn tạo mới khi được gọi để không bị đột biến dữ liệu
  CACHED_PACKAGES = SPECS.map((s, idx) => taoBaiMau(s, idx));
  return CACHED_PACKAGES.map((p) => p.article);
}

export function taoNhatKyMau(): LogEntry[] {
  const packages = layTatCaGoiBai();
  const allLogs = packages.flatMap((p) => p.logs);
  return allLogs.sort((a, b) => b.thoiDiem.localeCompare(a.thoiDiem));
}
