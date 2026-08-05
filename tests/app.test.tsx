import { describe, expect, test } from 'vitest';
import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('App', () => {
  test('renders title and file drop', async () => {
    const user = userEvent.setup();
    render(createElement(App));
    expect(screen.getByText(/극한 벽짓고 살아남기 Remaster Bank Editor/i)).toBeDefined();
    expect(screen.getByText(/.SC2Bank 파일을 드래그 앤 드롭/)).toBeDefined();
    await user.click(screen.getByRole('button', { name: '파일 선택' }));
  });
});
