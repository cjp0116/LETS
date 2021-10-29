import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import useDebounce from 'hooks/useDebounce';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Input,
	Spinner,
	Row,
	Col,
} from 'reactstrap';
import Api from 'api/api';
import { Link } from 'react-router-dom';
import './searchDesign.css';

const Search = (props) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState(null);
	const [isSearching, setIsSearching] = useState(false);
	const [hideSearchResults, setHideSearchResults] = useState(false);
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const PF = process.env.REACT_APP_PUBLIC_FOLDER;
	const history = useHistory();
	useEffect(() => {
		const handleSearch = async () => {
			try {
				setIsSearching(true);
				const res = await Api.request(
					`users?username=${debouncedSearchTerm}&firstName=${debouncedSearchTerm}&lastName=${debouncedSearchTerm}&email=${debouncedSearchTerm}`
				);
				const users = res.users;
				setResults(users);
			} catch (e) {
				console.error(e);
			}
		};

		if (debouncedSearchTerm) {
			setIsSearching(true);
			handleSearch();
		} else {
			setResults(null);
		}
	}, [debouncedSearchTerm]);

	useEffect(() => {
		if (results) {
			setIsSearching(false);
		}
	}, [results]);

	const handleChange = async (e) => {
		setSearchTerm(e.target.value);
		console.log(debouncedSearchTerm);
	};
	console.debug('results', results);

	return (
		<>
			<InputGroup>
				<InputGroupAddon addonType='prepend'>
					<InputGroupText>
						<i className='fas fa-search' />
					</InputGroupText>
				</InputGroupAddon>
				<Input
					placeholder='Search'
					type='text'
					value={searchTerm}
					onChange={handleChange}
					onFocus={() => setHideSearchResults(false)}
					onBlur={() => setHideSearchResults(true)}
				/>
				<InputGroupAddon addonType='append'>
					<InputGroupText>
						{isSearching ? (
							<Spinner
								className='main-search'
								size='sm'
								color='primary'
							/>
						) : (
							<i
								onClick={() => {
									console.log('x clicked');
									setSearchTerm('');
								}}
								className='ni ni-fat-remove'
							/>
						)}
					</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
			<div className={`${hideSearchResults ? 'hide-row-container' : 'row-container'}`}>
				<div className='inner-row-container'>
					{results ? (
						results.length === 0 ? (
							<Row className='no-match'>
								<Col>No match</Col>
							</Row>
						) : (
							results.map((user) => (
								<Row
									className='search-result'
									key={user.username}
								>
									<Col className='img'>
										<Link onMouseDown={() => history.push(`/profile/${user.username}`)} to={`/profile/${user.username}`}>
											<img
												alt='...'
												src={
													user.profileImage
														? PF + user.profileImage
														: require('assets/img/placeholder.jpg')
												}
											/>
										</Link>
									</Col>
									<Col className='name-column'>
										<h5>
											<a
												href='#x'
												onClick={(e) =>
													e.preventDefault()
												}
											>
												{user.firstName} {user.lastName}
											</a>
											<small>{user.username}</small>
										</h5>
									</Col>
								</Row>
							))
						)
					) : null}
				</div>
			</div>
		</>
	);
};
export default Search;
