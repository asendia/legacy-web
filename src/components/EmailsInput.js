import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import withStyles from '@mui/styles/withStyles';
import { validateEmail } from '../Validate';
import { styles, reactSelectStyle } from './EmailsInput.styles';

function EmailsInput(props) {
  const [emailInputError, setEmailInputError] = useState(() => false);
  function handleEmailsChange(emails) {
    props.onEmailsChange && props.onEmailsChange(emails);
  }
  function handleEmailInputChange(emailInput, action) {
    props.onEmailInputChange && props.onEmailInputChange(emailInput, action);
  }
  function handleKeyDown(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
      case ',':
        event.preventDefault();
        addEmail();
        break;
      default:
    }
  }
  // Hack since react-select clear input on blur
  function addEmail() {
    const isValid = validateEmail(props.emailInput);
    if (isValid) {
      const emails = [...props.emails, createEmailOption(props.emailInput)];
      handleEmailsChange(emails);
      handleEmailInputChange('');
    }
    setEmailInputError(!isValid && props.emailInput !== '');
  }
  const showToLabel = props.emailInput || props.emails.length > 0;
  const newStyles =
    emailInputError || props.error
      ? {
          ...reactSelectStyle,
          control: () => ({
            border: 'none',
            borderBottom: '2px solid #f44336',
          }),
          placeholder: (obj) => ({
            ...obj,
            color: '#f44336',
          }),
        }
      : reactSelectStyle;
  newStyles.valueContainer = (obj) => ({ ...obj, paddingLeft: showToLabel ? '20px' : '0' });
  return (
    <FormControl
      className={props.classes.formControl}
      size={'small'}
      variant={'standard'}
    >
      {showToLabel && <InputLabel style={{ top: '1px' }}>To</InputLabel>}
      <CreatableSelect
        id={props.id}
        name={'input-email-receivers'}
        onChange={handleEmailsChange}
        onInputChange={handleEmailInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => addEmail()}
        isMulti
        menuIsOpen={false}
        noOptionsMessage={() => 'Please enter valid email'}
        formatCreateLabel={(input) => `Press enter to add ${input}`}
        placeholder={!showToLabel && 'Recipients'}
        components={components}
        styles={newStyles}
        value={props.emails}
        inputValue={props.emailInput}
      />
      <FormHelperText error={emailInputError || props.error}>
        {emailInputError
          ? `"${props.emailInput}" is an invalid email`
          : props.helperText}
      </FormHelperText>
    </FormControl>
  );
}

export default withStyles(styles)(EmailsInput);

const components = {
  DropdownIndicator: null,
  ClearIndicator: null,
};

export function createEmailOption(label) {
  return {
    label,
    value: label,
  };
}
