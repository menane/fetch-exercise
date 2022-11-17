import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

function RegistrationForm() {
    //Create state variables to keep track of the form, the options populated from the API, and the form validation errors
    const defaultState = {
        name: '',
        email: '',
        password: '',
        occupation: '',
        state: ''
    }
    const [formDetails, updateDetails] = useState(defaultState);
    const [optionsList, updateOccupations] = useState({});
    const [errors, updateErrors ] = useState({})

    /* Generate the occupations and state data after the form renders initially. 
    We pass an empty [] for the second argument to run this effect and clean it up only once 
    (on mount and unmount) */
    useEffect(() => {
        fetch('https://frontend-take-home.fetchrewards.com/form')
           .then((res) => res.json())
           .then((data) => {
              updateOccupations(data);
           })
           .catch((err) => {
              console.log(err.message);
           });
     }, []);

     //Generate the select dropdowns for occupations and state
    const generateOptions = (list, dropdown) => {
        let options = [];
        if (Object.keys(list).length && dropdown === "occupations") {
            options = list.occupations.map((occupationTitle) => {
                return (
                    <option value={occupationTitle}>{occupationTitle}</option>
                )
            })
            options.unshift(<option value="defaultOccupation">Select an occupation</option>)
            return options
        } 
        else if (Object.keys(list).length && dropdown === "states") {
            options = list.states.map((state) => {
                return (
                    <option value={state.abbreviation}>{state.name}</option>
                )
            })
            options.unshift(<option value="defaultState">Select a state</option>)
            return options
        }
        else {
            return []
        }
    }

    //Update the state with the values typed into the form
    //Also, check for errors. If they exist, remove them (temporarily) so they won't show up on UI while user is correcting their mistake(s). 
    const handleChange = (value, detail) => {
        updateDetails({ ...formDetails, [detail]: value });

        if(errors[detail]) {
            updateErrors({ ...errors, [detail]: null})
        }
    }

    //To ensure privacy, this function is for the "Show Password" functionality on the UI. 
    //It toggles the password visibility to be on or off.
    const showPassword = () => {
        const checkbox = document.getElementById("password");
        if (checkbox.type === "password") {
            checkbox.type = "text";
        } else {
            checkbox.type = "password";
        }
    }
    
    //Validates our form before proceeding with submitting our data to the backend
    const formHasErrors = () => {
        const { name, email, password, occupation, state } = formDetails;
        const formErrors = {}

        //Ensure that the name is valid
        /* Name Criteria (p.s., I kept it simple for the most basic scenarios)
            - Must be only alphabet characters.
            - Must have at least two characters for first and last name.
            - Must have one space in between names.
        */
        const validNameRegex = /^[A-Za-z]{2,} [A-Za-z]{2,}$/
        if (!validNameRegex.test(name)) {
            console.log('Error: Please type in your full first name and last name, separated by a space.')
            formErrors.name = 'Please type in your full first name and last name, separated by a space.'
            //return false
        }

        //Ensure that the email is valid
        /* Email Criteria (p.s., like the name, I kept it simple for the most basic scenarios): 
            - Must start with at least one character
            - Must have an @ afterwards
            - Must have at least one charcter for the name of site
            - Followed by a dot
            - Finally, it must end with at least two characters for the domain 
        */
        const validEmailRegex = /^\S+@\S+\.\S{2,}$/
        if (!validEmailRegex.test(email)) {
            console.log('Error: Email invalid')
            formErrors.email = 'Please type in a valid email.'
        }

        //Ensure password is valid 
        /*  I made the assumption here for eight characters based on Googling what the average length of a password would be. 
            Also, since many different companies have many different standards for when it comes to passwords, I decided that
            I would just stick with ensuring that the user has entered at least one number in their password.
        */
        if (password.length < 8) {
            formErrors.password = 'Please enter a password at least eight characters long.'
        }
        if (password.length >= 8 && !/\d/.test(password)) {
            formErrors.password = 'Password must contain at least one number.'
        }

        //Ensure occupation is valid
        if (occupation === "") {
            formErrors.occupation = 'Please select an occupation.'
        }

        //Ensure state is valid
        if (state === "") {
            formErrors.state = 'Please select a state.'
        }

        //Return the errors object
        return formErrors
    }
    
    //Send request to the server with the options and return appropriate response
    const handleSubmit = (event) => {
        event.preventDefault();
        const formErrors = formHasErrors();

        //If errors exist, update the state and alert the user. 
        //If there are no errors then go ahead and send the POST request
        if (Object.keys(formErrors).length > 0) {
            updateErrors(formErrors)
        }
        else {
            let options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({...formDetails})
            }
            fetch('https://frontend-take-home.fetchrewards.com/form', options)
            .then((res) => res.json())
            .then((post) => {
                console.log(post)
                alert("Congrats! Your account has successfully registered.")
            })
            .catch((err) => {
                console.log(err.message);
                alert("Uh-oh! There was an error with your request")
            });
            
        }
    }
    
 
    return (
        <Container className="form-container">
            <h1 className="title">Account registration</h1>
            <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="form-element" controlId="name" value={formDetails.name} onChange={(e) => handleChange(e.target.value, "name")}>
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control required isInvalid={errors.name} placeholder="Enter your first and last name, separated by a space" />
                    <Form.Control.Feedback type='invalid'>{errors.name}</Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="form-element" controlId="email" value={formDetails.name} onChange={(e) => handleChange(e.target.value, "email")}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control required isInvalid={errors.email} type="email" placeholder="Enter a valid email" />
                    <Form.Control.Feedback type='invalid'>{errors.email}</Form.Control.Feedback>
                </Form.Group>

                <Row className="form-element">
                    <Form.Group controlId="password"  value={formDetails.password} onChange={(e) => handleChange(e.target.value, "password")}>
                        <Form.Label>Password</Form.Label>
                        <Form.Control required isInvalid={errors.password} type="password" placeholder="Enter a password" />
                        <Form.Control.Feedback type='invalid'>{errors.password}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="form-element__pw" controlId="checkbox">
                        <Form.Check type="checkbox" label="Show password" onClick={showPassword}/>
                    </Form.Group>
                </Row>
                

                <Form.Group className="form-element" controlId="occupation">
                    <Form.Label>Occupation</Form.Label>
                    <Form.Select isInvalid={errors.occupation} onChange={(e) => handleChange(e.target.value, "occupation")}>
                        {generateOptions(optionsList, "occupations")}
                    </Form.Select>
                    <Form.Control.Feedback type='invalid'>{errors.occupation}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="form-element" controlId="state">
                    <Form.Label>State</Form.Label>
                    <Form.Select isInvalid={errors.state} onChange={(e) => handleChange(e.target.value, "state")}>
                        {generateOptions(optionsList, "states")}
                    </Form.Select>
                    <Form.Control.Feedback type='invalid'>{errors.state}</Form.Control.Feedback>
                </Form.Group>
                <br />
                <Button type="submit">Submit form</Button>
            </Form>
        </Container>
    )
}

export default RegistrationForm;