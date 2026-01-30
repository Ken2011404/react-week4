import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ modalType, templateProduct, getProducts, closeModal }) {
  const [tempData, setTempData] = useState(templateProduct);
  useEffect(() => {
    setTempData(templateProduct);
  }, [templateProduct]);
  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTempData((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleImageChange = (index, value) => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl]; // 複製陣列
      newImages[index] = value; // 更新特定索引
      // 填寫最後一個空輸入框時，自動新增空白輸入框
      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }

      // 清空輸入框時，移除最後的空白輸入框
      if (
        value === "" &&
        newImages.length > 1 &&
        newImages[newImages.length - 1] === ""
      ) {
        newImages.pop();
      }
      return { ...prevData, imagesUrl: newImages }; // 回傳新狀態
    });
  };

  // 新增圖片
  const handleAddImage = () => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.push("");
      return { ...prevData, imagesUrl: newImages };
    });
  };

  // 移除圖片
  const handleRemoveImage = () => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.pop();
      return { ...prevData, imagesUrl: newImages };
    });
  };

  const updateProduct = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product `;
    let method = `post`;
    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = `put`;
    }
    const productData = {
      data: {
        ...tempData,
        origin_price: Number(tempData.origin_price),
        price: Number(tempData.price),
        is_enabled: tempData.is_enabled ? 1 : 0,
        imageUrl: [...tempData.imagesUrl.filter((url) => url !== "")],
      },
    };

    try {
      const response = await axios[method](url, productData);
      // console.log(response.data);
      getProducts();
      closeModal();
    } catch (error) {
      const errorMsg = error.response?.data?.message || err.message;
      console.log(`${modalType === "edit" ? "更新" : "新增"}失敗：`, errorMsg);
      alert(`${modalType === "edit" ? "更新" : "新增"}失敗：${errorMsg}`);
    }
  };

  const uploadImage = async (e) => {
    const url = `${API_BASE}/api/${API_PATH}/admin/upload`;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file-to-upload", file);

      const response = await axios.post(url, formData);

      setTempData((prevData) => ({
        ...prevData,
        imageUrl: response.data.imageUrl,
      }));
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  const delProduct = async (id) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`,
      );
      closeModal();
      getProducts();
    } catch (error) {
      console.lod(error.response);
    }
  };
  return (
    <div
      id='productModal'
      className='modal fade'
      tabIndex='-1'
      aria-labelledby='productModalLabel'
      aria-hidden='true'>
      <div className='modal-dialog modal-xl'>
        <div className='modal-content border-0'>
          <div
            className={`modal-header bg-${modalType === "delete" ? "danger" : "dark"} text-white`}>
            <h5 id='productModalLabel' className='modal-title'>
              <span>
                {modalType === "delete"
                  ? "刪除"
                  : modalType === "edit"
                    ? "編輯"
                    : "新增"}
                產品
              </span>
            </h5>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'></button>
          </div>
          <div className='modal-body'>
            {modalType === "delete" ? (
              <p className='fs-4'>
                確認刪除
                <span className='text-danger'>{tempData.title}</span>?
              </p>
            ) : (
              <div className='row'>
                <div className='col-sm-4'>
                  <div className='mb-2'>
                    <div className='mb-3'>
                      <label htmlFor='fileUpload' className='form-label'>
                        上傳圖片
                      </label>
                      <input
                        type='file'
                        accept='.jpg,.jpeg,.png'
                        className='form-control'
                        name='fileUpload'
                        id='fileUpload'
                        onChange={(e) => uploadImage(e)}
                      />
                    </div>
                    <div className='mb-3'>
                      <label htmlFor='imageUrl' className='form-label'>
                        輸入圖片網址
                      </label>
                      <input
                        type='text'
                        id='imageUrl'
                        name='imageUrl'
                        className='form-control'
                        placeholder='請輸入圖片連結'
                        value={tempData.imageUrl}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                    {tempData.imageUrl && (
                      <img
                        className='img-fluid'
                        src={tempData.imageUrl}
                        alt='主圖'
                      />
                    )}
                  </div>
                  <div>
                    {tempData.imagesUrl.map((url, index) => (
                      <div key={index}>
                        <label htmlFor='imageUrl' className='form-label'>
                          輸入圖片網址
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          placeholder={`圖片網址${index + 1}`}
                          value={url}
                          onChange={(e) =>
                            handleImageChange(index, e.target.value)
                          }
                        />
                        {url && (
                          <img
                            className='img-fluid'
                            src={url}
                            alt={`副圖${index + 1}`}
                          />
                        )}
                      </div>
                    ))}
                    {tempData.imagesUrl.length < 5 &&
                      tempData.imagesUrl[tempData.imagesUrl.length - 1] !==
                        "" && (
                        <button
                          className='btn btn-outline-primary btn-sm d-block w-100'
                          onClick={() => handleAddImage()}>
                          新增圖片
                        </button>
                      )}
                  </div>
                  <div>
                    {tempData.imagesUrl.length >= 1 && (
                      <button
                        className='btn btn-outline-danger btn-sm d-block w-100'
                        onClick={() => handleRemoveImage()}>
                        刪除圖片
                      </button>
                    )}
                  </div>
                </div>
                <div className='col-sm-8'>
                  <div className='mb-3'>
                    <label htmlFor='title' className='form-label'>
                      標題
                    </label>
                    <input
                      name='title'
                      id='title'
                      type='text'
                      className='form-control'
                      placeholder='請輸入標題'
                      value={tempData.title}
                      onChange={(e) => handleModalInputChange(e)}
                      disabled={modalType === "edit"}
                    />
                  </div>

                  <div className='row'>
                    <div className='mb-3 col-md-6'>
                      <label htmlFor='category' className='form-label'>
                        分類
                      </label>
                      <input
                        name='category'
                        id='category'
                        type='text'
                        className='form-control'
                        placeholder='請輸入分類'
                        value={tempData.category}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                    <div className='mb-3 col-md-6'>
                      <label htmlFor='unit' className='form-label'>
                        單位
                      </label>
                      <input
                        name='unit'
                        id='unit'
                        type='text'
                        className='form-control'
                        placeholder='請輸入單位'
                        value={tempData.unit}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                  </div>

                  <div className='row'>
                    <div className='mb-3 col-md-6'>
                      <label htmlFor='origin_price' className='form-label'>
                        原價
                      </label>
                      <input
                        name='origin_price'
                        id='origin_price'
                        type='number'
                        min='0'
                        className='form-control'
                        placeholder='請輸入原價'
                        value={tempData.origin_price}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                    <div className='mb-3 col-md-6'>
                      <label htmlFor='price' className='form-label'>
                        售價
                      </label>
                      <input
                        name='price'
                        id='price'
                        type='number'
                        min='0'
                        className='form-control'
                        placeholder='請輸入售價'
                        value={tempData.price}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                  </div>
                  <hr />

                  <div className='mb-3'>
                    <label htmlFor='description' className='form-label'>
                      產品描述
                    </label>
                    <textarea
                      name='description'
                      id='description'
                      className='form-control'
                      placeholder='請輸入產品描述'
                      value={tempData.description}
                      onChange={(e) => handleModalInputChange(e)}></textarea>
                  </div>
                  <div className='mb-3'>
                    <label htmlFor='content' className='form-label'>
                      說明內容
                    </label>
                    <textarea
                      name='content'
                      id='content'
                      className='form-control'
                      placeholder='請輸入說明內容'
                      value={tempData.content}
                      onChange={(e) => handleModalInputChange(e)}></textarea>
                  </div>
                  <div className='mb-3'>
                    <div className='form-check'>
                      <input
                        name='is_enabled'
                        id='is_enabled'
                        className='form-check-input'
                        type='checkbox'
                        checked={tempData.is_enabled}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                      <label className='form-check-label' htmlFor='is_enabled'>
                        是否啟用
                      </label>
                    </div>
                  </div>
                  <div className='mb-3'>
                    <label className='form-check-label' htmlFor='star'>
                      商品評價星級
                    </label>
                    <select
                      id='star'
                      name='star'
                      className='form-select'
                      aria-label='Default select example'
                      value={tempData.star}
                      onChange={(e) => handleModalInputChange(e)}>
                      <option value=''>請選擇</option>
                      <option value='5★'>★★★★★</option>
                      <option value='4★'>★★★★</option>
                      <option value='3★'>★★★</option>
                      <option value='2★'>★★</option>
                      <option value='1★'>★</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className='modal-footer'>
            {modalType === "delete" ? (
              <button
                type='button'
                className='btn btn-danger'
                onClick={() => delProduct(tempData.id)}>
                刪除
              </button>
            ) : (
              <>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  data-bs-dismiss='modal'
                  onClick={() => closeModal()}>
                  取消
                </button>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => updateProduct(tempData.id)}>
                  確認
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
