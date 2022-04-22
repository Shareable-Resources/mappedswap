"use strict";
// import './Sidebar.css'
// import { useState, useEffect } from 'react'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import Avatar from 'react-avatar'
// import { faAngleDoubleRight, faHome, faUsers, faTrophy, faSignOutAlt, faWallet } from '@fortawesome/free-solid-svg-icons'
// const Sidebar = () => {
// 	const [userIdState, setUserIdState] = useState()
// 	useEffect(() => {
// 		setUserIdState(localStorage.getItem('userId'))
// 	})
// 	const handleSignOut = () => {
// 		localStorage.removeItem('token')
// 		localStorage.removeItem('userId')
// 		localStorage.removeItem('admin')
// 		window.location = '/auth'
// 	}
// 	return (
// 		<div className="sideNavbar">
// 			<ul className="navLi">
// 				<li className="navTab">
// 					<div onClick={() => window.location = '/'} className="navLink">
// 						<FontAwesomeIcon icon={faHome} id="navIcon" />
// 						<span className="navSpan">Home</span>
// 					</div>
// 				</li>
// 				<li className="navTab" id="userTab">
// 					<div className="navLink">
// 						<Avatar name={userIdState} size='45' round={true} />
// 						<span className="navSpan">{userIdState}</span>
// 					</div>
// 				</li>
// 				<li className="navTab">
// 					<div onClick={handleSignOut} className="navLink">
// 						<FontAwesomeIcon icon={faSignOutAlt} id="navIcon" />
// 						<span className="navSpan">Log out</span>
// 					</div>
// 				</li>
// 			</ul>
// 		</div>
// 	)
// }
// export default Sidebar
//# sourceMappingURL=Sidebar.js.map