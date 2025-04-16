// src/tests/BlogEdit.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BlogEdit from '../pages/BlogEdit';
import { AppContextProvider } from '../context/AppContext';

test('should edit an existing blog', async () => {
  
    render(
    <MemoryRouter initialEntries={['/blogs/1/edit']}>
        <AppContextProvider>
            <BlogEdit/>
            </AppContextProvider>
            
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated Blog' } });
  fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Updated content for the blog' } });
  fireEvent.click(screen.getByText(/Save/i));

  await waitFor(() => screen.getByText('Blog updated successfully'));
  expect(screen.getByText('Blog updated successfully')).toBeInTheDocument();
});
