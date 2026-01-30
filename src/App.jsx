import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";

import "./assets/style.css";
import ProductModal from "./components/ProductModal";
import Pagination from "./components/Pagination";
import Login from "./views/Login";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
  star: "",
};

function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);

  // Modal 控制相關狀態
  const productModalRef = useRef(null);
  const [modalType, setModalType] = useState(""); // "create", "edit", "delete"

  // 產品表單資料模板
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);

  const [pagination, setPagination] = useState({});

  //確認是否登入

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });
    // Modal 關閉時移除焦點
    document
      .querySelector("#productModal")
      .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });

    const checkLogin = async () => {
      try {
        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log(response.data);
        setIsAuth(true);
        getProducts();
      } catch (error) {
        console.log(error.response.data.message);
      }
    };
    checkLogin();
  }, []);

  const openModal = (type, product) => {
    setTemplateProduct({
      ...INITIAL_TEMPLATE_DATA,
      ...product,
    });

    // 設定 Modal 類型並顯示
    setModalType(type);
    productModalRef.current.show();
  };

  const closeModal = () => {
    productModalRef.current.hide();
  };

  const getProducts = async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      console.log("產品列表載入成功：", response.data.products);
    } catch (error) {
      console.error("取得產品列表失敗：", err.response?.data?.message);
      alert(
        "取得產品列表失敗：" + (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <>
      {!isAuth ? (
        <Login getProducts={getProducts} setIsAuth={setIsAuth} />
      ) : (
        <div className='container'>
          <h2>產品列表</h2>
          <div className='container'>
            {/* 新增產品按鈕 */}
            <div className='text-end mt-4'>
              <button
                type='button'
                className='btn btn-primary'
                onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}>
                建立新的產品
              </button>
            </div>

            {/* 產品列表表格 */}
          </div>
          <table className='table'>
            <thead>
              <tr>
                <th>分類</th>
                <th>產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>編輯</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.title}</td>
                    <td>{item.origin_price}</td>
                    <td>{item.price}</td>
                    <td className={`${item.is_enabled ? "text-success" : ""}`}>
                      {item.is_enabled ? "啟用" : "未啟用"}
                    </td>
                    <td>
                      <div
                        className='btn-group'
                        role='group'
                        aria-label='Basic example'>
                        <button
                          type='button'
                          className='btn btn-outline-primary btn-sm'
                          onClick={() => openModal("edit", item)}>
                          編輯
                        </button>
                        <button
                          type='button'
                          className='btn btn-outline-danger btn-sm'
                          onClick={() => openModal("delete", item)}>
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='5'>尚無產品資料</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination pagination={pagination} onChangePage={getProducts} />
        </div>
      )}
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        getProducts={getProducts}
        closeModal={closeModal}
      />
    </>
  );
}

export default App;
