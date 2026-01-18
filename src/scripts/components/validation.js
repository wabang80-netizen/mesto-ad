// Показывает ошибку под полем: добавляет стили и текст ошибки.
const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`); //элемент для ошибки
  
  if (errorElement) {
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
  }
};

// Скрывает ошибку: убирает стили и очищает текст.
const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  if (errorElement) {
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.classList.remove(settings.errorClass);
    errorElement.textContent = '';
  }
};

// Проверяет валидность поля. 
// Если оно невалидно, вызывает showInputError, иначе — hideInputError. 
// В случае, если в поля «Имя» или «Название» введён любой символ, кроме латинской буквы, кириллической буквы и дефиса, выводит кастомное сообщение об ошибке: 
// Текст ошибки разместить в data-* атрибуте поля ввода.
const checkInputValidity = (formElement, inputElement, settings) => {
  const customErrorMessage = inputElement.dataset.errorMessage;
  
  //невалидные символы
  if (inputElement.validity.patternMismatch && customErrorMessage) {
    showInputError(formElement, inputElement, customErrorMessage, settings);
  } 
  //какая-то другая ошибка
  else if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
  } 
  //нет ошибок
  else {
    hideInputError(formElement, inputElement, settings);
  }
};

//true, если какое-то поле не прошло валидацию.
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => {
    return !inputElement.validity.valid;
  });
};

//деактивирирует кнопку формы
const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

//активирует кнпку формы
const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

// включает или отключает кнопку формы в зависимости от валидности всех полей. 
// Если хотя бы одно из полей не прошло валидацию, кнопка формы должна быть неактивной. 
// Если оба поля прошли, делает активной.
const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

//добавляет обработчики события input для всех полей формы. 
// При каждом вводе проверяет валидность поля и вызывает функцию toggleButtonState.
const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector)); //все поля внутри формы
  const buttonElement = formElement.querySelector(settings.submitButtonSelector); //кнопка
  
  toggleButtonState(inputList, buttonElement, settings);
  
  //события input для каждого поля
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

//очищает ошибки валидации формы и делает кнопку неактивной.
//Принимает DOM-элемент формы и объект с настройками. Используйте эту функцию при открытии формы редактирования профиля.
export const clearValidation = (formElement, settings) => {

  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector)); //все поля внутри формы
  const buttonElement = formElement.querySelector(settings.submitButtonSelector); //кнопка
  
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });
  
  disableSubmitButton(buttonElement, settings);
  
  formElement.reset();
};

//отвечает за включение валидации всех форм. 
// Функция должна принимать все нужные функциям селекторы элементов как объект настроек.
export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector)); //все формы на странице
  
  formList.forEach((formElement) => {
    formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
    });
    
    setEventListeners(formElement, settings);
  });
};