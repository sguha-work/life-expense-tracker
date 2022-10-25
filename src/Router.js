import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home/Home";
import AddExpense from "./pages/AddExpense/AddExpense";
import ListExpense from "./pages/ListExpense/ListExpense";
const Router = ()=>(
    <BrowserRouter basename="/life-expense-tracker">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="add-expense" element={<AddExpense />} />
          <Route path="list-expense" element={<ListExpense />} />
        </Route>
      </Routes>
    </BrowserRouter>
);
export default Router;