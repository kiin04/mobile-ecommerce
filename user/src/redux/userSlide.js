import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        id: null,
        name: "",
        email: "",
        image: "",
        role: "",
        email:"",
        phone:"",
        address: "",
        totalBuy: 0,
        isLoggedIn: false,
    },
    reducers: {
        setUser: (state, action) => {
            return { ...state, ...action.payload, isLoggedIn: true };
        },
        logoutUser: (state) => {
            return {
                id: null,
                name: "",
                email: "",
                image: "",
                role: "",
                address: "",
                email:"",
                phone:"",
                totalBuy: 0,
                isLoggedIn: false,
            };
        },
    },
});

export const { setUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
