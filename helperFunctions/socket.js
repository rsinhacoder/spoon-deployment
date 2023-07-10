import { server } from "../server.js";
import { Server } from "socket.io";

export const socketConnection = () => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    socket.on("orders", (data) => {
      if (data.order) {
        io.emit("new_order", { placed: true });
      }
      if (data.changeStatus) {
        io.emit(data.customerId, data);
      }
    });
    socket.on("changeAvailability", (data) => {
      if (data.category) {
        io.emit("categoryAvailability", data);
      }
      if (data.foodItem) {
        io.emit("itemAvailability", data);
      }
      if (data.resturant) {
        io.emit("resturantAvailability", data);
      }
    });
  });
};
