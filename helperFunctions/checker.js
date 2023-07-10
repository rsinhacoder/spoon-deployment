const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const phoneNoFormat = /^\d{10}$/;

export const emailFormatChecker = (email) => {
  if (email.match(mailFormat)) {
    return true;
  } else {
    return false;
  }
};

export const phoneNumberFormatChecker = (phoneNumber) => {
  if (phoneNumber.match(phoneNoFormat)) {
    return true;
  } else {
    return false;
  }
};

export const nameChecker = (name) => {
  if (name.trim() === "" || name.trim() === null) {
    return false;
  } else {
    return true;
  }
};

export const addressChecker = (address) => {
  if (address.trim() === "" || address.trim() === null) {
    return false;
  } else {
    return true;
  }
};
