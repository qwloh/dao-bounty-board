import { useContext } from "react";
import { AnchorContext } from "../context/AnchorContextProvider";

export const useAnchorContext = () => useContext(AnchorContext);
