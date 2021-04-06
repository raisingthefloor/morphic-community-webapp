import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import Header from "@/components/Header";

import store from '@/store'
import Home from "@/views/Home";

const routes = [
    {path: '/', component: Home},
]

function renderHeaderComponent(customStore, routes){
    return render(Header, {routes, store : {...store, ...customStore}});
}




describe('Header Component Testing', () => {
    test('Header Component Render Correctly', async () => {
        const { debug } =  renderHeaderComponent(Header, routes)
        debug()
    })
})
