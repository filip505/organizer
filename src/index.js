import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Route } from "react-router-dom";
import Dashboard from './screen/dashboard.screen'

function App() {
    return (
        <BrowserRouter>
            <Route component={Dashboard} />
        </BrowserRouter >
    )
}

ReactDom.render(<App />, document.getElementById('root'))