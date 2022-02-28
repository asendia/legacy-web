import React from 'react';

function Footer() {
  return (
    <footer style={{ paddingBottom: '20px', fontSize: '12px', textAlign: 'center' }}>
        {'2018 - 2022'}<br />
        {'warisin - '}
        {'source code: '}
        <a target='_blank' rel='noopener noreferrer' href='https://github.com/asendia/legacy-web'>web</a>
        {', '}
        <a target='_blank' rel='noopener noreferrer' href='https://github.com/asendia/legacy-api'>api</a>
    </footer>
  );
}

export default Footer;
