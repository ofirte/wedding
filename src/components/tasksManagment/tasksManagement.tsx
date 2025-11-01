import React, { FC } from "react";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";

const TasksManagement: FC = () => {
  const { data: allTasks } = useAllWeddingsTasks();
  console.log(allTasks);
  return (
    <div>
      <h1>Tasks Management</h1>
      {/* Add your tasks management components here */}
    </div>
  );
};
export default TasksManagement;
