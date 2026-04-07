import React from 'react'
import { ErrorMessage, Field, Formik, Form } from 'formik';
import * as Yup from 'yup';
import '../css/Login.css';
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email nije validan').required('Email je obavezan'),
  password: Yup.string().required('Lozinka je obavezna')
});

const Login = () => {
     const navigate = useNavigate();

  const initialLoginValues = {
    email: '',
    password: ''
  };

  const handleLoginSubmit = async (values) => {
  try {
    const res = await api.post("/auth/login", values);

    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);

    alert("Uspešna prijava!");
    navigate("/");
  } catch (error) {
    const errorMsg = error.response?.data?.detail || "Greška pri prijavi";
    alert(errorMsg);
  }
};
  return (
    <div className="loginform-container">
      <Formik
        initialValues={initialLoginValues}
        validationSchema={LoginSchema}
        onSubmit={handleLoginSubmit}
      >
        <Form className="loginform-form">
          <h2 className="loginform-title">Prijavite se:</h2>

          <div className="loginform-field">
            <label htmlFor="email">Adresa elektronske pošte</label>
            <Field id="email" name="email" type="email" />
            <ErrorMessage name="email" component="div" className="loginform-error" />
          </div>

          <div className="loginform-field">
            <label htmlFor="password">Lozinka</label>
            <Field id="password" name="password" type="password" />
            <ErrorMessage name="password" component="div" className="loginform-error" />
          </div>

          <button type="submit" className="loginform-button">Prijavite se</button>

          <div className="login-footer-links">
            <span>Nemate nalog?</span>
            <Link to="/register">Registrujte se</Link>
            </div>
        </Form>
      </Formik>
    </div>
  )
}

export default Login