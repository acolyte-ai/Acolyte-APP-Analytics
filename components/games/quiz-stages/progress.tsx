import React, { useEffect, useState } from "react";
import { Progress } from "antd";

interface Props {
    next: () => void
}



const UpdatingRank: React.FC<Props> = ({ next }) => {
    const [count, setCount] = useState(6);

    useEffect(() => {
        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else {

            next()
        }
        // You can trigger the next step here once countdown ends
    }, [count]);

    return (
        <div className="flex flex-col  items-center justify-center font-pt-sans">
            <h1 className="text-[40px] font-semibold mb-4 text-emerald-400 dark:text-emerald-400">Updating your rank</h1>
            <p className="text-center text-wrap tracking-wide text-lg mb-8 text-white">
                Case Closed. Rank Updated.<br />
                New challenge drops at dawn.
            </p>
            <div className="relative flex items-center justify-center mb-10">
                <Progress
                    type="circle"
                    percent={((count - 1) / 5) * 100}

                    strokeColor='#36AF8D'
                    format={() =>

                        <span className="text-white text-5xl font-bold">
                            {count - 1}s
                        </span>
                    }
                    width={150}
                    strokeWidth={10}
                    trailColor='#143A3A'
                />
            </div>
            <p className="text-center text-lg tracking-wide text-white">Next step loads automatically</p>
        </div>
    );
};

export default UpdatingRank;
