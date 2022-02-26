import React from 'react';
import Logo from './warisin-logo.png';

const styleLogoLine = {
  position: 'absolute',
  bottom: '5px',
  width: '40px',
  height: '3px',
  background: '#171717',
};

function Header() {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '10px 0',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img src={Logo} width={'30px'} height={'30px'} alt={'warisin logo'} />
        <div style={{ ...styleLogoLine, left: '-45px' }}></div>
        <div style={{ ...styleLogoLine, right: '-45px' }}></div>
      </div>
      <h1
        style={{
          fontSize: '22px',
          margin: '-5px 0 0',
          fontWeight: 'lighter',
          letterSpacing: '2px',
        }}
      >
        {'warisin'}
      </h1>
    </header>
  );
}

export default Header;
