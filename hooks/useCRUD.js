import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import nookies from "nookies";

const useCrud = (endpoint) => {
  const [data, setData] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    const authToken = cookies["token"];
    setToken(authToken);
  }, []);

  useEffect(() => {
    const cookies = nookies.get(null);
    const token = cookies["token"];

    if (token) {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    }
  }, []);

  const errorReset = () => {
    setError({});
  };

  const fetchAllData = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}?${queryParams}`;
      const res = await axios.get(url, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setData(res?.data?.data);
      setResponse(res?.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const create = async (newData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`,
        newData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      return response;
    } catch (err) {
      console.error("Full error response:", err);
      setError(err.response?.data?.errors);
      throw new Error(err.response?.data?.errors || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, updatedData) => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}/${id}`,
        updatedData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      return res;
    } catch (err) {
      setError(err.response?.data?.errors || "Failed to update");
      throw new Error(err.response?.data?.errors || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}/${id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/signin`,
        credentials
      );
      const token = res.data.token;
      document.cookie = `token=${token}; path=/;`;
      localStorage.setItem("token", token);
      return token;
    } catch (err) {
      setError(err.response?.data?.errors || "Failed to login");
      throw err?.response?.data?.errors;
    } finally {
      setLoading(false);
    }
  };

  return {
    token,
    data,
    response,
    loading,
    error,
    errorReset,
    fetchAllData,
    create,
    update,
    remove,
    login,
  };
};

export default useCrud;
