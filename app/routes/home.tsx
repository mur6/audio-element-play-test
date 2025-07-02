import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { AutoPlayAudio } from "../components/AutoPlayAudio";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

// interface FirstPageProps {
//   onClick?: () => void;
// }
// function FirstPage({ onClick }: FirstPageProps) {
//   return (
//     <div>
//       <div
//         style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}
//       >
//         <button
//           onClick={onClick}
//           style={{ padding: "10px 20px", fontSize: "16px" }}
//         >
//           Start beep
//         </button>
//       </div>
//     </div>
//   );
// }
const playlist = ["/audio/low_beep.mp3", "/audio/high_beep.mp3"];

export default function Home() {
  const intervals = [5000, 10000, 30000, 60000]; // 5秒、10秒、30秒、60秒
  const [uiFired, setUiFired] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const audioRef = useRef<{ play: (playlist: string[]) => void }>(null);

  // const handlePlayPlaylist = (playlist: string[]) => {
  //   audioRef.current?.play(playlist);
  // };

  //ボタンが押されてから段階的にビープを再生（5秒→10秒→30秒→60秒）
  useEffect(() => {
    if (!uiFired) return;

    const scheduleNextBeep = (intervalIndex: number) => {
      if (intervalIndex >= intervals.length) {
        // 最後のインターバルに達したら、60秒間隔で繰り返し
        intervalIndex = intervals.length - 1;
      }

      const currentInterval = intervals[intervalIndex];
      setCountdown(Math.ceil(currentInterval / 1000));

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play(playlist);
        }
        setCountdown(0);

        // 次のビープをスケジュール
        setTimeout(() => {
          setCurrentIntervalIndex((prev) => prev + 1);
        }, 100);
      }, currentInterval);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    };

    const cleanup = scheduleNextBeep(currentIntervalIndex);
    return cleanup;
  }, [uiFired, currentIntervalIndex]);

  return (
    <>
      <div>
        <h1>Welcome to React Router!</h1>
        <p>This is a simple audio playback example.</p>
        {uiFired && countdown > 0 ? (
          <p>{countdown} 秒後にビープ音が再生されます。</p>
        ) : uiFired && countdown === 0 ? (
          <p>ビープ音を再生中...</p>
        ) : (
          <p>ボタンを押してビープ音を開始してください。</p>
        )}
        <button
          onClick={() => {
            setUiFired(true);
            if (audioRef.current) {
              audioRef.current.play(playlist);
            }
            setCurrentIntervalIndex(0); // インデックスをリセット
          }}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Play Beep
        </button>
        {uiFired && (
          <AutoPlayAudio ref={audioRef} />
        )}
      </div>
    </>
  );
}
