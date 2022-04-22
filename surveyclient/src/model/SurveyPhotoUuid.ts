import { v4 as uuidv4 } from "uuid";

// Extracted to separate module for test mocking - uuid is misbehaving in tests
export default function getPhotoUuid() {
  return uuidv4();
}
