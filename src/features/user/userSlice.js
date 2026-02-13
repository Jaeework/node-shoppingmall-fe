import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      if (!email || !password) {
        const error = new Error("모든 필드를 입력해주세요.");
        error.isUserError = true;
        throw error;
      }
      const response = await api.post("/auth/login", { email, password });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {};
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      if (!email || !name || !password) {
        const error = new Error("모든 필드를 입력해주세요.");
        error.isUserError = true;
        throw error;
      }
      const response = await api.post("/users", { email, name, password });
      // 1. 성공 토스트 메세지 보여주기
      dispatch(showToastMessage({message: "회원가입에 성공했습니다. 로그인 해주세요.", status: "success"}));
      // 2. 로그인 페이지로 리다이렉트
      navigate("/login");

      return response.data.data;
    } catch (error) {
      // 1. 실패 토스트 메세지를 보여준다.
      dispatch(showToastMessage({message: "회원가입에 실패했습니다.", status: "error"}));
      // 2. 에러 값을 저장
      // 2-1. 유저에게 그대로 보여줘도 되는 메세지
      if (error.isUserError) return rejectWithValue(error.message);

      // 2-2. 그 외의 에러 메세지
      return rejectWithValue("회원가입 도중 오류가 발생하였습니다. 관리자에 문의하세요.");
    }
  }
);

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {}
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;
      })
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.loginError = null;
        state.user = action.payload.user;
        sessionStorage.setItem("token", action.payload.token);
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
