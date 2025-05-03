import axios from "axios";

// services/categoryService.js or similar

export const createCat = async (formData) => {
  try {
    const axiosResponse = await axios.post(
      `${import.meta.env.VITE_API_URL}/create-category`,
      formData,
      {
        withCredentials: true,
        // Don't manually set multipart headers; Axios handles this.
      }
    );
    return axiosResponse.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(errorMessage);
  }
};


// Update Category
const updateCat = async ({ name, slug }) => {
    try {
        const axiosResponse = await axios.put(
            `${import.meta.env.VITE_API_URL}/update-category/${slug}`,
            { name },
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );
        return axiosResponse.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(errorMessage);
    }
};

// Delete Category
const deleteCat = async (slug) => {
    try {
        const axiosResponse = await axios.delete(
            `${import.meta.env.VITE_API_URL}/delete-category/${slug}`,
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            }
        );
        return axiosResponse.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(errorMessage);
    }
};

// Get Single Categories
const getSingleCat = async (slug) => {
    try {
        const axiosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/single-category/${slug}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return axiosResponse.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(errorMessage);
    }
};

// Get All Categories
const getAllCat = async () => {
    try {
        const axiosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/all-category`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return axiosResponse.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(errorMessage);
    }
};

const categoryService = { createCat, getAllCat, deleteCat, updateCat, getSingleCat };

export default categoryService;
