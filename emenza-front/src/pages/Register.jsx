import { ErrorMessage, Field, Formik, Form } from 'formik';
import '../css/Register.css';
import * as Yup from 'yup';
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";


const RegisterSchema = Yup.object().shape({
  "stud-kartica": Yup.string().required('Broj studentske kartice je obavezan'),
  email: Yup.string().email('Email nije validan').required('Email je obavezan'),
  password: Yup.string().min(6, 'Lozinka mora da ima najmanje 6 karaktera').required('Lozinka je obavezna'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Lozinke se ne poklapaju'),
  status: Yup.string().required('Status je obavezan')
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
          <h2 className="registerform-title">Registrujte se:</h2>

          <div className="registerform-field">
            <label htmlFor="stud-kartica">Broj studentske kartice</label>
            <Field id="stud-kartica" name="stud-kartica" type="text" />
            <ErrorMessage name="stud-kartica" component="div" className="registerform-error" />
          </div>

          <div className="registerform-field">
            <label htmlFor="email">Adresa elektronske pošte</label>
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
            <label>Odaberite status</label>
            <div className="registerform-radio-group">
              <label className="radio-label">
                <Field type="radio" name="status" value="budzet" />
                Budžet
              </label>
              <label className="radio-label">
                <Field type="radio" name="status" value="samofinansiranje" />
                Samofinansiranje
              </label>
            </div>
            <ErrorMessage name="status" component="div" className="registerform-error" />
          </div>

          <button type="submit" className="registerform-button">Registrujte se</button>

          <div className="register-footer-links">
            <span>Imate nalog?</span>
            <Link to="/login">Prijavite se</Link>
            </div>  
        </Form>
      </Formik>
    </div>
  );
}

export default Register;