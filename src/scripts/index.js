/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addNewCard } from "./components/api.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// DOM узлы
let currentUserId;

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoTitle = infoModalWindow.querySelector(".popup__title");
const infoList = infoModalWindow.querySelector(".popup__info");
const infoText = infoModalWindow.querySelector(".popup__text");
const infoUserList = infoModalWindow.querySelector(".popup__list");

const logoElement = document.querySelector(".logo");

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const createInfoItem = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const infoItem = template.content.querySelector(".popup__info-item").cloneNode(true);
  
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  
  return infoItem;
};

const createUserBadge = (userName) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const badge = template.content.querySelector(".popup__list-item").cloneNode(true);
  
  badge.textContent = userName;
  
  return badge;
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Обработчик клика по логотипу, который показывает статистику пользователей
const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      infoTitle.textContent = "Статистика пользователей";
      infoList.innerHTML = "";
      infoUserList.innerHTML = "";
      
      // получаем уникальных пользователей
      const uniqueUsers = new Set();
      cards.forEach(card => {
        uniqueUsers.add(card.owner._id);
      });
      
      // находим пользователя с максимальным количеством карточек
      const userCardCount = {};
      cards.forEach(card => {
        const ownerId = card.owner._id;
        if (!userCardCount[ownerId]) {
          userCardCount[ownerId] = {
            name: card.owner.name,
            count: 0
          };
        }
        userCardCount[ownerId].count++;
      });
      
      let maxCards = 0;
      let championName = "";
      for (const userId in userCardCount) {
        if (userCardCount[userId].count > maxCards) {
          maxCards = userCardCount[userId].count;
          championName = userCardCount[userId].name;
        }
      }
      
      // добавляем информацию в список
      infoList.append(createInfoItem("Всего карточек:", cards.length));
      
      // первая создана (самая старая публикация)
      if (cards.length > 0) {
        const oldestCard = cards.reduce((oldest, current) => {
          return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
        }, cards[0]);
        infoList.append(createInfoItem("Первая создана:", formatDate(new Date(oldestCard.createdAt))));
      }
      
      // последняя создана (самая новая публикация)
      if (cards.length > 0) {
        const newestCard = cards.reduce((newest, current) => {
          return new Date(current.createdAt) > new Date(newest.createdAt) ? current : newest;
        }, cards[0]);
        infoList.append(createInfoItem("Последняя создана:", formatDate(new Date(newestCard.createdAt))));
      }
      
      infoList.append(createInfoItem("Всего пользователей:", uniqueUsers.size));
      infoList.append(createInfoItem("Максимум карточек от одного:", maxCards));
      
      infoText.textContent = "Все пользователи:";
      
      // Добавляем всех пользователей в список
      const usersSet = new Set();
      cards.forEach(card => {
        if (!usersSet.has(card.owner.name)) {
          usersSet.add(card.owner.name);
          infoUserList.append(createUserBadge(card.owner.name));
        }
      });
      
      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderLoading = (button, isLoading, loadingText = "Сохранение...") => {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = button.dataset.originalText;
  }
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  
  if (!submitButton.dataset.originalText) {
    submitButton.dataset.originalText = submitButton.textContent;
  }
  
  renderLoading(submitButton, true);
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  
  if (!submitButton.dataset.originalText) {
    submitButton.dataset.originalText = submitButton.textContent;
  }
  
  renderLoading(submitButton, true);
  
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  
  if (!submitButton.dataset.originalText) {
    submitButton.dataset.originalText = submitButton.textContent;
  }
  
  renderLoading(submitButton, true, "Создание...");
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(
          newCard,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: likeCard,
            onDeleteCard: deleteCard,
          },
          currentUserId
        )
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

logoElement.addEventListener("click", handleLogoClick);

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(
          card,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: likeCard,
            onDeleteCard: deleteCard,
          },
          
          currentUserId
        )
      );
    });
  })
  .catch((err) => {
    console.log(err); // выводим ошибку в консоль
  });
