import { Navigate, useParams } from 'react-router-dom';
import { isRoomId, ROOM_BY_ID } from '../config/rooms';
import { isRoomUnlocked } from '../utils/progress';

/** Legacy /room/:id URLs redirect straight into the simulation. */
export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  if (!isRoomId(roomId)) {
    return <Navigate to="/" replace />;
  }

  const room = ROOM_BY_ID[roomId];

  if (!isRoomUnlocked(room.order)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Navigate
      to={`/simulation?step=${room.simulationStep ?? room.order}`}
      replace
    />
  );
}
