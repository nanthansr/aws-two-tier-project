import Cookies from "js-cookie";
import { userActionTypes } from "../constants/usersAction.types";
import { login, endpoint } from "../../endpoints";

const usersActionCreator = (actionType, payload = {}) => {
  switch (actionType) {
    case userActionTypes.LOGIN_SUCCESS:
      return async (dispatch) => {
        try {
          // 1. Prepare Credentials
          // Defensive check: If payload is a JSON string, parse it. Otherwise use it directly.
          const creds = typeof payload.formObject === 'string' 
            ? JSON.parse(payload.formObject) 
            : payload.formObject;

          // 2. Convert to Form Data (Critical for FastAPI OAuth2)
          const formData = new URLSearchParams();
          // Map the user's 'email' input to the 'username' field required by the backend
          formData.append("username", creds.email); 
          formData.append("password", creds.password);

          // 3. Send Request
          let response = await fetch(login, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          });

          // 4. Handle Errors (401/422)
          if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.detail || "Login failed");
          }

          // 5. Success - Extract Token
          let data = await response.json();
          
          // FastAPI returns: { access_token: "...", token_type: "bearer" }
          // We save this into the cookie.
          Cookies.set("jwt", data.access_token);
          Cookies.set("isLoggedIn", "true");

          dispatch({
            type: userActionTypes.LOGIN_SUCCESS,
            payload: { isLoggedIn: true },
          });

        } catch (error) {
          console.error("Login Error:", error);
          dispatch({
            type: userActionTypes.LOGIN_FAILURE,
            payload: { isLoggedIn: false, loginError: error.message },
          });
        }
      };

    case userActionTypes.AUTHORIZED:
      return async (dispatch) => {
        try {
          let myHeaders = new Headers();
          myHeaders.append("Authorization", "Bearer " + Cookies.get("jwt"));
          
          let response = await fetch(endpoint, {
            headers: myHeaders,
            mode: "cors",
          });

          if (response.ok) {
            // Depending on your API, this might return an array directly or an object
            // Adjust this destructuring based on your GET /blogs response structure
            let data = await response.json();
            
            // If data IS the array, use data directly. If it's { blogs: [] }, use data.blogs
            const blogsArray = Array.isArray(data) ? data : data.blogs || [];

            dispatch({
              type: userActionTypes.LOGIN_SUCCESS,
              payload: { isLoggedIn: true },
            });
            dispatch({
              type: userActionTypes.LOAD_BLOGS,
              payload: { blogs: [...blogsArray] },
            });
          } else {
            // Token is invalid or expired
            Cookies.remove("jwt");
            Cookies.set("isLoggedIn", "false");
            dispatch({
              type: userActionTypes.LOGIN_FAILURE,
              payload: { isLoggedIn: false, loginError: "Session expired" },
            });
          }
        } catch (error) {
          console.error("Auth Error:", error);
        }
      };

    case userActionTypes.LOGOUT:
      Cookies.remove("jwt");
      Cookies.set("isLoggedIn", "false");
      return { type: userActionTypes.LOGOUT, payload: { isLoggedIn: false } };

    default:
      return {
        type: "Invalid Action",
      };
  }
};

export default usersActionCreator;