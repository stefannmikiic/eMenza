import { ErrorMessage, Field, Formik, Form } from 'formik';
import '../css/Register.css';
import * as Yup from 'yup';
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";


const RegisterSchema = Yup.object().shape({
  "stud-kartica": Yup.string().required('Student card number is required'),
  email: Yup.string().email('Email is not valid').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
  status: Yup.string().required('Status is required')
});

function Register() {

  const navigate = useNavigate();

  const initialRegisterValues = {
    "stud-kartica": '',
    email: '',
    password: '',
    confirmPassword: '',
    status: ''
  };

  const handleRegisterSubmit = async (values) => {
  try {
    const res = await api.post("/auth/register", values);

    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);

    alert("Uspešna registracija!");
    navigate("/");
  } catch (error) {
    const errorMsg = error.response?.data?.detail || "Došlo je do greške";
    alert(errorMsg);
  }
};

  return (
    <div className="registerform-container">
      <Formik
        initialValues={initialRegisterValues}
        validationSchema={RegisterSchema}
        onSubmit={handleRegisterSubmit}
      >
        <Form className="registerform-form">
          <h2 className="registerform-title">Registruj se:</h2>

          <div className="registerform-field">
            <label htmlFor="stud-kartica">Broj studentske kartice</label>
            <Field id="stud-kartica" name="stud-kartica" type="text" />
            <ErrorMessage name="stud-kartica" component="div" className="registerform-error" />
          </div>

          <div className="registerform-field">
            <label htmlFor="email">Adresa elektronske poste</label>
            <Field id="email" name="email" type="email" />
            <ErrorMessage name="email" component="div" className="registerform-error" />
          </div>

          <div className="registerform-field">
            <label htmlFor="password">Lozinka</label>
            <Field id="password" name="password" type="password" />
            <ErrorMessage name="password" component="div" className="registerform-error" />
          </div>

          <div className="registerform-field">
            <label htmlFor="confirmPassword">Potvrdite lozinku</label>
            <Field id="confirmPassword" name="confirmPassword" type="password" />
            <ErrorMessage name="confirmPassword" component="div" className="registerform-error" />
          </div>
          <div className="registerform-field">
            <label>Choose a status</label>
            <div className="registerform-radio-group">
              <label>
                <Field type="radio" name="status" value="budzet" />
                Budzet
              </label>
              <label>
                <Field type="radio" name="status" value="samofinansiranje" />
                Samofinansiranje
              </label>
            </div>
            <ErrorMessage name="status" component="div" className="registerform-error" />
          </div>

          <button type="submit" className="registerform-button">Registruj se</button>

          <div className="register-footer-links">
            <span>Imate nalog?</span>
            <Link to="/login">Prijavi se</Link>
            </div>  
        </Form>
      </Formik>
    </div>
  );
}

export default Register;