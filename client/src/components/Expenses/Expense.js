import { useSelector } from "react-redux";
import styles from "./Expense.module.css";
import React, { useEffect, useRef, useState } from "react";

const Expense = () => {
  const [expenseData,getExpenseData] = useState([]);
  const [update,setUpdate] = useState(false);
  const formRef = useRef(null);
  const token = useSelector((state)=>state.auth.token)
  console.log(token,"userIdExpense")

  const submitHandler = async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    let data = {
      amount: formData.get("amount"),
      category: formData.get("category"),
      description: formData.get("description"),
    };
  
    try {
      const response = await fetch("http://localhost:3000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        console.log("Expense added successfully");
      } else {
        console.error("Failed to add expense");
      }
  
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    }
    setUpdate(!update);
  };
  useEffect(()=>{
    const fetchData = async() => {
      const response = await fetch(`http://localhost:3000`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      const data = await response.json();
      console.log("getData",data); 
      getExpenseData(data);
    };
    fetchData();

  },[update,token])

  const deleteExpense = async(id) => {
  try {
    const response = await fetch(`http://localhost:3000/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    if (response.ok) {
      console.log("Expense deleted successfully");
      setUpdate(!update); // Re-fetch data after deletion
    } else {
      console.error("Failed to delete expense");
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};
  return (
    <div className={styles.mainContainer}>
      <div className={styles.expenseInput}>
        <form onSubmit={submitHandler} ref={formRef}>
          <div className={styles.formDiv}>
            <input
              type="number"
              name="amount"
              placeholder="Enter Amount"
              required
            />
            <select name="category" required>
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Petrol">Petrol</option>
              <option value="Groceries">Groceries</option>
              <option value="Travel">Travel</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className={styles.formDiv}>
            <textarea
              type="text"
              name="description"
              placeholder="Enter Description"
              required
            />
          </div>
          <div className={styles.formDiv}>
            <button type="submit">Add Expense</button>
          </div>
        </form>
      </div>
      <div className={styles.expensesOutput}>
        <ul>
          {
            expenseData.length === 0 ? <p>Data Not Found</p> :
            expenseData.map((expense)=>{
              return(
                <li key={expense.id}>
                  <div className={styles.data}>
                  <p>{expense.category}</p>
                  <p>{expense.amount}</p>
                  <p>{expense.description}</p>
                  </div>
                  <div className={styles.DataBtns}>
                    <button>Edit</button>
                    <button onClick={()=>deleteExpense(expense.id)}>Delete</button>
                  </div>
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  );
};

export default Expense;
