declare module "react" {
  interface SVGProps<T = {}> {
    slot?: string;
  }
}

type IconProps = (props: React.SVGProps<SVGSVGElement>) => JSX.Element;

export const AddIcon: IconProps = (props) => (
  <svg
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e8eaed"
    {...props}
  >
    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
  </svg>
);

export const PersonIcon: IconProps = (props) => (
  <svg
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e8eaed"
    {...props}
  >
    <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
  </svg>
);

export const DeleteIcon: IconProps = (props) => (
  <svg
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e8eaed"
    {...props}
  >
    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
  </svg>
);

export const CheckIcon: IconProps = (props) => (
  <svg
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#e8eaed"
    {...props}
  >
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);
