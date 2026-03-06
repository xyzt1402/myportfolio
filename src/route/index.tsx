import Layout from '../components/Layout';
import Resume from '../pages/Resume';
import ChatLTV from '../pages/ChatLTV';
import NovelTranslator from '../pages/NovelTranslator';
import { useRoutes } from 'react-router';

/**
 * Central route definitions for the app.
 * All routes are nested under the Layout component which provides
 * the header and common layout structure.
 */
const Routes = () => {
    return useRoutes([
        {
            path: '/',
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <Resume />,
                },
                {
                    path: 'chat',
                    element: <ChatLTV />,
                },
                {
                    path: 'translate',
                    element: <NovelTranslator />,
                },
            ],
        },
    ])
}

export default Routes;