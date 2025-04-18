// src/pages/BlogDelete.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppContextProvider } from '../context/AppContext';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import '@testing-library/jest-dom';
import BlogList from '../pages/BlogList';

jest.mock('axios');

test('should delete a blog', async () => {

  axios.delete.mockResolvedValueOnce({ data: { message: 'Blog deleted successfully.' } });

  render(
    <MemoryRouter>
        <AppContextProvider>
            <BlogList/>

        </AppContextProvider>
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText('Delete Blog'));

  await waitFor(() => screen.getByText('Blog deleted successfully.'));
  expect(screen.getByText('Blog deleted successfully.')).toBeInTheDocument();
});
