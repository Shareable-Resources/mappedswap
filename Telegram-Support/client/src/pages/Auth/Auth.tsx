import UserAPI from "../../utils/userAPI/userAPI";
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export interface ITarget {
	target: {
		name: string;
		value: any;
	}
}

const Auth = () => {
	const [userState, setUserState] = useState<any>({
		email: '',
		password: '',
		username: ''
	});


	const handleInputChange = ({ target: { name, value } }: ITarget) => setUserState({ ...userState, [name]: value });

	const handleLoginUser = (event: any) => {
		event.preventDefault();
		UserAPI.login(userState)
			.then(({ data }) => {
				if (data.result.token) {
					localStorage.setItem('token', data.result.token)
					localStorage.setItem('userId', data.result.userId)
					localStorage.setItem('admin', data.result.admin)
					// window.location = '/'
				}
				else {
					alert('User unable to login')
				}
			})
			.catch(err => console.error(err));
	}

	return (
		<div className="olor-overlay d-flex justify-content-center align-items-center">
			<Form className="rounded p-4 p-sm-3">
				<Form.Group className="mb-3 signInWidthBox" controlId="email">
					<Form.Control
						type="text"
						placeholder="Enter your email"
						name="email"
						value={userState.username}
						onChange={handleInputChange} />
				</Form.Group>
				<Form.Group className="mb-3 signInWidthBox" controlId="password">
					<Form.Control
						type="password"
						placeholder="Enter your password"
						name="password"
						value={userState.password}
						onChange={handleInputChange} />
				</Form.Group>
				<Button id="signIn"
					className="me-3"
					variant="warning"
					type="submit"
					onClick={handleLoginUser} >
					Sign In
				</Button>
			</Form>
		</div>
	)
}

export default Auth