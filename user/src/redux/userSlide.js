import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        id: null,
        name: "",
        image: "",
        role: "",
        email:"",
        account:"",
        phone:"",
        address: "",
        dateofBirth:"",
        totalBuy: 0,
        isGoogleAcc: false,
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
                account:"",
                role: "",
                address: "",
                phone:"",
                dateofBirth:"",
                totalBuy: 0,
                isGoogleAcc: false,
                isLoggedIn: false,
            };
        },
    },
});

export const { setUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
