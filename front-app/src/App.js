import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {Provider} from 'react-redux';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/layout/Home';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import Auth from './components/auth/Auth';
import NotFound from './components/not-found/NotFound';

import store from './store';

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <Navbar />
                        <div className="Container">
                            <Switch>
                                <Route exact path="/" component={Home} />
                                <Route path="/register" component={Register} />
                                <Route path="/login" component={Auth} />
                                <Route path="/profile" component={Profile} />
                                <Route component={NotFound} />
                            </Switch>
                        </div>
                        <Footer />
                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;


