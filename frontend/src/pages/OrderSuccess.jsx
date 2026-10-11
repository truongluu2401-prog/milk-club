    
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <CheckCircle2 className="mx-auto text-green-600" size={72} />

      <h1 className="mt-6 text-3xl font-bold">
        Đã tạo đơn hàng thử nghiệm!
      </h1>

      {order ? (
        <>
          <p className="mt-4 text-gray-600">
            Mã đơn hàng: <strong>{order.id}</strong>
          </p>
          <p className="mt-2 text-gray-600">
            Trạng thái: {order.status} - {order.paymentStatus}
          </p>
          <p className="mt-4 text-sm text-amber-700">
            Đây là đơn hàng demo lưu trên trình duyệt,
            chưa được gửi đến cửa hàng thực tế.
          </p>
        </>
      ) : (
        <p className="mt-4 text-gray-600">
          Không có thông tin đơn hàng mới trong phiên này.
        </p>
      )}

      <Link
        to="/"
        className="mt-8 inline-block rounded-xl bg-orange-600 px-8 py-4 font-semibold text-white"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
