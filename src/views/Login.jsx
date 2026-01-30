import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({ getProducts, setIsAuth }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };
  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;

      // 設定 cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 設定 axios header
      axios.defaults.headers.common["Authorization"] = token;

      getProducts();
      // 設定登入成功狀態
      setIsAuth(true);
    } catch (error) {
      alert("登入失敗: ", error.response.data.message);
      setIsAuth(false);
    }
  };

  return (
    <div className='container login'>
      <h1 className='fs-5 fw-bold'>請先登入</h1>
      <form onSubmit={(e) => onSubmit(e)}>
        <div className='form-floating mb-3'>
          <input
            type='email'
            className='form-control'
            name='username'
            placeholder='name@example.com'
            autoComplete='username'
            value={formData.username}
            onChange={(e) => handleInputChange(e)}
          />
          <label htmlFor='username'>Email address</label>
        </div>
        <div className='form-floating'>
          <input
            type='password'
            className='form-control'
            name='password'
            placeholder='Password'
            autoComplete='current-password'
            value={formData.password}
            onChange={(e) => handleInputChange(e)}
          />
          <label htmlFor='password'>Password</label>
        </div>
        <button type='submit' className='btn btn-primary my-3 w-100'>
          登入
        </button>
      </form>
    </div>
  );
}
export default Login;
