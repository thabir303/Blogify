// src/pages/BlogCreate.test.js
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AppContextProvider } from '../context/AppContext';
import BlogCreate from '../pages/CreateBlog';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';


test('should create a new blog', async () => {
  
    render(
        <MemoryRouter>
            <AppContextProvider>
                <BlogCreate/>
            </AppContextProvider>
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value : 'Test blog'}});
    fireEvent.change(screen.getByLabelText(/content/i), {target: { value : 'This is a test blog content'}});
    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => screen.getByText('Blog created successfully'));
    expect(screen.getAllByText('Blog created successfully')).toBeInTheDocument();
})
