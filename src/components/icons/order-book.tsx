export const OrderBook = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path fill="var(--color-ask)" d="M2 3h6v6H2z"></path>
    <path fill="var(--color-bid)" d="M2 11h6v6H2z"></path>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M10 3h8v3.5h-8zm0 5.25h8v3.5h-8zm8 5.25h-8V17h8z"
      clipRule="evenodd"
    ></path>
  </svg>
);
