# Calling the Kernel

_Data Parallelism and Task Parallelism_

As stated in the "1-3-3 Types of Parallelism" section, parallelizable code is either "Data Parallel" or "Task Parallel". In OpenCL, the difference between the two is whether the same kernel or different kernels are executed in parallel. The difference becomes obvious in terms of execution time when executed on the GPU.

At present, most GPUs contain multiple processors, but hardware such as instruction fetch and program counters are shared across the processors. For this reason, the GPUs are incapable of running different tasks in parallel.

As shown in **Figure 4.3**, when multiple processors perform the same task, the number of tasks equal to the number of processors can be performed at once. **Figure 4.4** shows the case when multiple tasks are scheduled to be performed in parallel on the GPU. Since the processors can only process the same set of instructions across the cores, the processors scheduled to process Task B must be in idle mode until Task A is finished.

**Figure 4.3: Efficient use of the GPU**

![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_7.58.32_AM.png>)

For data parallel tasks suited for a device like the GPU, OpenCL provides an API to run the same kernel across multiple processors, called clEnqueueNDRangeKernel(). When developing an application, the task type and the hardware need to be considered wisely, and use the appropriate API function.

This section will use vector-ized arithmetic operation to explain the basic method of implementations for data parallel and task parallel commands. The provided sample code is meant to illustrate the parallelization concepts.

The sample code performs the basic arithmetic operations, which are addition, subtraction, multiplication and division, between float values. The overview is shown in **Figure 4.5**.

**Figure 4.5: Basic arithmetic operations between floats**

![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_7.59.59_AM.png>)

As the figure shows, the input data consists of 2 sets of 4x4 matrices A and B. The output data is a 4x4 matrix C.

We will first show the data-parallel implementation (**List 4.8**, **List 4.9**). This program treats each row of data as one group in order to perform the computation.

**List 4.8: Data parallel model - kernel dataParallel.cl**

```
__kernel void dataParallel(__global float *A, __global float *B, __global float *C)
{
    int base = 4 * get_global_id(0);

    C[base + 0] = A[base + 0] + B[base + 0];
    C[base + 1] = A[base + 1] - B[base + 1];
    C[base + 2] = A[base + 2] * B[base + 2];
    C[base + 3] = A[base + 3] / B[base + 3];
}
```

**List 4.9: Data parallel model - host dataParallel.c**

```
#include <stdio.h>
#include <stdlib.h>

#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif

#define MAX_SOURCE_SIZE (0x100000)

int main()
{
    cl_platform_id platform_id = NULL;
    cl_device_id device_id = NULL;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem Amobj = NULL;
    cl_mem Bmobj = NULL;
    cl_mem Cmobj = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;

    int i, j;
    float *A;
    float *B;
    float *C;

    A = (float *)malloc(4 * 4 * sizeof(float));
    B = (float *)malloc(4 * 4 * sizeof(float));
    C = (float *)malloc(4 * 4 * sizeof(float));

    FILE *fp;
    const char fileName[] = "./dataParallel.cl";
    size_t source_size;
    char *source_str;

    /* Load kernel source file */
    fp = fopen(fileName, "r");
    if (!fp)
    {
        fprintf(stderr, "Failed to load kernel.¥n");
        exit(1);
    }
    source_str = (char *)malloc(MAX_SOURCE_SIZE);
    source_size = fread(source_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Initialize input data */
    for (i = 0; i < 4; i++)
    {
        for (j = 0; j < 4; j++)
        {
            A[i * 4 + j] = i * 4 + j + 1;
            B[i * 4 + j] = j * 4 + i + 1;
        }
    }

    /* Get Platform/Device Information 
ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms); 
ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id, &ret_num_devices); 

/* Create OpenCL Context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    *Create command queue * /
        command_queue = clCreateCommandQueue(context, device_id, 0, &ret);

    *Create Buffer Object * /
        Amobj = clCreateBuffer(context, CL_MEM_READ_WRITE, 4 * 4 * sizeof(float), NULL, &ret);
    Bmobj = clCreateBuffer(context, CL_MEM_READ_WRITE, 4 * 4 * sizeof(float), NULL, &ret);
    Cmobj = clCreateBuffer(context, CL_MEM_READ_WRITE, 4 * 4 * sizeof(float), NULL, &ret);

    /* Copy input data to the memory buffer */
    ret = clEnqueueWriteBuffer(command_queue, Amobj, CL_TRUE, 0, 4 * 4 * sizeof(float), A, 0, NULL, NULL);
    ret = clEnqueueWriteBuffer(command_queue, Bmobj, CL_TRUE, 0, 4 * 4 * sizeof(float), B, 0, NULL, NULL);

    /* Create kernel program from source file*/
    program = clCreateProgramWithSource(context, 1, (const char **)&source_str, (const size_t *)&source_size, &ret);
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create data parallel OpenCL kernel */
    kernel = clCreateKernel(program, "dataParallel", &ret);

    /* Set OpenCL kernel arguments */
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&Amobj);
    ret = clSetKernelArg(kernel, 1, sizeof(cl_mem), (void *)&Bmobj);
    ret = clSetKernelArg(kernel, 2, sizeof(cl_mem), (void *)&Cmobj);

    size_t global_item_size = 4;
    size_t local_item_size = 1;

    /* Execute OpenCL kernel as data parallel */
    ret = clEnqueueNDRangeKernel(command_queue, kernel, 1, NULL,
                                 &global_item_size, &local_item_size, 0, NULL, NULL);

    /* Transfer result to host */
    ret = clEnqueueReadBuffer(command_queue, Cmobj, CL_TRUE, 0, 4 * 4 * sizeof(float), C, 0, NULL, NULL);

    /* Display Results */
    for (i = 0; i < 4; i++)
    {
        for (j = 0; j < 4; j++)
        {
            printf("%7.2f ", C[i * 4 + j]);
        }
        printf("¥n");
    }

    /* Finalization */
    ret = clFlush(command_queue);
    ret = clFinish(command_queue);
    ret = clReleaseKernel(kernel);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(Amobj);
    ret = clReleaseMemObject(Bmobj);
    ret = clReleaseMemObject(Cmobj);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    free(source_str);

    free(A);
    free(B);
    free(C);

    return 0;
}
```

Next, we will show the task parallel version of the same thing (**List 4.10**, **List 4.11**). In this sample, the tasks are grouped according to the type of arithmetic operation being performed.

**List 4.10: Task parallel model - kernel taskParallel.cl**

```
__kernel void taskParallelAdd(__global float *A, __global float *B, __global float *C)
{
    int base = 0;

    C[base + 0] = A[base + 0] + B[base + 0];
    C[base + 4] = A[base + 4] + B[base + 4];
    C[base + 8] = A[base + 8] + B[base + 8];
    C[base + 12] = A[base + 12] + B[base + 12];
}

__kernel void taskParallelSub(__global float *A, __global float *B, __global float *C)
{
    int base = 1;

    C[base + 0] = A[base + 0] - B[base + 0];
    C[base + 4] = A[base + 4] - B[base + 4];
    C[base + 8] = A[base + 8] - B[base + 8];
    C[base + 12] = A[base + 12] - B[base + 12];
}

__kernel void taskParallelMul(__global float *A, __global float *B, __global float *C)
{
    int base = 2;

    C[base + 0] = A[base + 0] * B[base + 0];
    C[base + 4] = A[base + 4] * B[base + 4];
    C[base + 8] = A[base + 8] * B[base + 8];
    C[base + 12] = A[base + 12] * B[base + 12];
}

__kernel void taskParallelDiv(__global float *A, __global float *B, __global float *C)
{
    int base = 3;

    C[base + 0] = A[base + 0] / B[base + 0];
    C[base + 4] = A[base + 4] / B[base + 4];
    C[base + 8] = A[base + 8] / B[base + 8];
    C[base + 12] = A[base + 12] / B[base + 12];
}
```

**List 4.11: Task parallel model - host taskParallel.c**

```
#include <stdio.h>
#include <stdlib.h>

#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif

#define MAX_SOURCE_SIZE (0x100000)

int main()
{
    cl_platform_id platform_id = NULL;
    cl_device_id device_id = NULL;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem Amobj = NULL;
    cl_mem Bmobj = NULL;
    cl_mem Cmobj = NULL;
    cl_program program = NULL;
    cl_kernel kernel[4] = {NULL, NULL, NULL, NULL};
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;

    int i, j;
    float *A;
    float *B;
    float *C;

    A = (float *)malloc(4 * 4 * sizeof(float));
    B = (float *)malloc(4 * 4 * sizeof(float));
    C = (float *)malloc(4 * 4 * sizeof(float));

    FILE *fp;
    const char fileName[] = "./taskParallel.cl";
    size_t source_size;
    char *source_str;

    /* Load kernel source file */
    fp = fopen(fileName, "rb");
    if (!fp)
    {
        fprintf(stderr, "Failed to load kernel.¥n");
        exit(1);
    }
    source_str = (char *)malloc(MAX_SOURCE_SIZE);
    source_size = fread(source_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Initialize input data */
    for (i = 0; i < 4; i++)
    {
        for (j = 0; j < 4; j++)
        {
            A[i * 4 + j] = i * 4 + j + 1;
            B[i * 4 + j] = j * 4 + i + 1;
        }
    }

    /* Get platform/device information */
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id, &ret_num_devices);

    /* Create OpenCL Context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create command queue */
    command_queue = clCreateCommandQueue(context, device_id, CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE, &ret);

    /* Create buffer object */
    Amobj = clCreateBuffer(context, CL_MEM_READ_WRITE, 4 * 4 * sizeof(float), NULL, &ret);
    Bmobj = clCreateBuffer(context, CL_MEM_READ_WRITE, 4 * 4 * sizeof(float), NULL, &ret);
    Cmobj = clCreateBuffer(context, CL_MEM_READ_WRITE, 4 * 4 * sizeof(float), NULL, &ret);

    /* Copy input data to memory buffer */
    ret = clEnqueueWriteBuffer(command_queue, Amobj, CL_TRUE, 0, 4 * 4 * sizeof(float), A, 0, NULL, NULL);
    ret = clEnqueueWriteBuffer(command_queue, Bmobj, CL_TRUE, 0, 4 * 4 * sizeof(float), B, 0, NULL, NULL);

    /* Create kernel from source */
    program = clCreateProgramWithSource(context, 1, (const char **)&source_str, (const size_t *)&source_size, &ret);
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create task parallel OpenCL kernel */
    kernel[0] = clCreateKernel(program, "taskParallelAdd", &ret);
    kernel[1] = clCreateKernel(program, "taskParallelSub", &ret);
    kernel[2] = clCreateKernel(program, "taskParallelMul", &ret);
    kernel[3] = clCreateKernel(program, "taskParallelDiv", &ret);

    /* Set OpenCL kernel arguments */
    for (i = 0; i < 4; i++)
    {
        ret = clSetKernelArg(kernel[i], 0, sizeof(cl_mem), (void *)&Amobj);
        ret = clSetKernelArg(kernel[i], 1, sizeof(cl_mem), (void *)&Bmobj);
        ret = clSetKernelArg(kernel[i], 2, sizeof(cl_mem), (void *)&Cmobj);
    }

    /* Execute OpenCL kernel as task parallel */
    for (i = 0; i < 4; i++)
    {
        ret = clEnqueueTask(command_queue, kernel[i], 0, NULL, NULL);
    }

    /* Copy result to host */
    ret = clEnqueueReadBuffer(command_queue, Cmobj, CL_TRUE, 0, 4 * 4 * sizeof(float), C, 0, NULL, NULL);

    /* Display result */
    for (i = 0; i < 4; i++)
    {
        for (j = 0; j < 4; j++)
        {
            printf("%7.2f ", C[i * 4 + j]);
        }
        printf("¥n");
    }

    /* Finalization */
    ret = clFlush(command_queue);
    ret = clFinish(command_queue);
    ret = clReleaseKernel(kernel[0]);
    ret = clReleaseKernel(kernel[1]);
    ret = clReleaseKernel(kernel[2]);
    ret = clReleaseKernel(kernel[3]);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(Amobj);
    ret = clReleaseMemObject(Bmobj);
    ret = clReleaseMemObject(Cmobj);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    free(source_str);

    free(A);
    free(B);
    free(C);

    return 0;
}
```

As you can see, the source codes are very similar. The only differences are in the kernels themselves, and the way to execute these kernels. In the data parallel model, the 4 arithmetic operations are grouped as one set of commands in a kernel, while in the task parallel model, 4 different kernels are implemented for each type of arithmetic operation.

At a glance, it may seem that since the task parallel model requires more code, that it also must perform more operations. However, regardless of which model is used for this problem, the number of operations being performed by the device is actually the same. Despite this fact, some problems are easier, and performance can vary by choosing one over the other, so the parallelization model must be considered wisely in the planning stage of the application.

We will now walkthrough the source code for the data parallel model.

> 001: \_\_kernel void dataParallel(\_\_global float \* A, \_\_global float \* B, \_\_global float \* C)

When the data parallel task is queued, work-items are created. Each of these work-items executes the same kernel in parallel.

> 003: int base = 4\*get\_global\_id(0);

The get\_global\_id(0) gets the global work-item ID, which is used to decide the data to process, so that each work-items can process different sets of data in parallel. In general, data parallel processing is done using the following steps.

1\. Get work-item ID

2\. Process the subset of data corresponding to the work-item ID

A block diagram of the process is shown in **Figure 4.6**.

**Figure 4.6: Block diagram of the data-parallel model in relation to work-items**

![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_8.20.51_AM.png>)

In this example, the global work-item is multiplied by 4 and stored in the variable "base". This value is used to decide which element of the array A and B gets processed.

> 005: C\[base+0] = A\[base+0] + B\[base+0];
>
> 006: C\[base+1] = A\[base+1] - B\[base+1];
>
> 007: C\[base+2] = A\[base+2] \* B\[base+2];
>
> 008: C\[base+3] = A\[base+3] / B\[base+3];

Since each work-item have different IDs, the variable "base" also have a different value for each work-item, which keeps the work-items from processing the same data. In this way, large amount of data can be processed concurrently.

We have discussed that numerous work items get created, but we have not touched upon how to decide the number of work-items to create. This is done in the following code segment from the host code.

> 090: size\_t global\_item\_size = 4;
>
> 091: size\_t local\_item\_size = 1;
>
> 092:
>
> 093: /\* Execute OpenCL kernel as data parallel \*/
>
> 094: ret = clEnqueueNDRangeKernel(command\_queue, kernel, 1, NULL,
>
> 095: \&global\_item\_size, \&local\_item\_size, 0, NULL, NULL); 090: size\_t global\_item\_size = 4;
>
> 091: size\_t local\_item\_size = 1;
>
> 092:
>
> 093: /\* Execute OpenCL kernel as data parallel \*/
>
> 094: ret = clEnqueueNDRangeKernel(command\_queue, kernel, 1, NULL,
>
> 095: \&global\_item\_size, \&local\_item\_size, 0, NULL, NULL);

The clEnqueueNDRangeKernel() is an OpenCL API command used to queue data parallel tasks. The 5th and 6th arguments determine the work-item size. In this case, the global\_item\_size is set to 4, and the local\_item\_size is set to 1. The overall steps are summarized as follows.

1\. Create work-items on the host

2\. Process data corresponding to the global work item ID on the kernel

We will now walkthrough the source code for the task parallel model. In this model, different kernels are allowed to be executed in parallel. Note that different kernels are implemented for each of the 4 arithmetic operations.

> 096: /\* Execute OpenCL kernel as task parallel \*/
>
> 097: for (i=0; i < 4; i++) {
>
> 098: ret = clEnqueueTask(command\_queue, kernel\[i], 0, NULL, NULL);
>
> 099: }

The above code segment queues the 4 kernels.

In OpenCL, in order to execute a task parallel process, the out-of-order mode must be enabled when the command queue is created. Using this mode, the queued task does not wait until the previous task is finished if there are idle compute units available that can be executing that task.

> 067: /\* Create command queue \*/
>
> 068: command\_queue = clCreateCommandQueue(context, device\_id, CL\_QUEUE\_OUT\_OF\_ORDER\_EXEC\_MODE\_ENABLE, \&ret);

The block diagram of the nature of command queues and parallel execution are shown in **Figure 4.7**.

**Figure 4.7: Command queues and parallel execution**

![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_8.26.20_AM.png>)

The clEnqueueTask() is used as an example in the above figure, but a similar parallel processing could take place for other combinations of enqueue-functions, such as clEnqueueNDRangeKernel(), clEnqueueReadBuffer(), and clEnqueueWriteBuffer(). For example, since PCI Express supports simultaneous bi-directional memory transfers, queuing the clEnqueueReadBuffer() and clEnqueueWriteBuffer() can execute read and write commands simultaneously, provided that the commands are being performed by different processors. In the above diagram, we can expect the 4 tasks to be executed in parallel, since they are being queued in a command queue that has out-of-execution enabled.

## _Work Group_

The last section discussed the concept of work-items. This section will introduce the concept of work-groups.

Work-items are grouped together into work-groups. A work-group must consist of at least 1 work-item, and the maximum is dependent on the platform. The work-items within a work-group can synchronize, as well as share local memory with each other.

In order to implement a data parallel kernel, the number of work-groups must be specified in addition to the number of work-items. This is why 2 different parameters had to be sent to the clEnqueueNDRangeKernel() function.

> 090: size\_t global\_item\_size = 4;
>
> 091: size\_t local\_item\_size = 1;

The above code means that each work-group is made up of 1 work-item, and that there are 4 work-groups to be processed.

The number of work-items per work-group is consistent throughout every work-group. If the number of work-items cannot be divided evenly among the work-groups, clEnqueueNDRangeKernel() fails, returning the error value CL\_INVALID\_WORK\_GROUP\_SIZE.

The code **List 4.9** only used the global work-item ID to process the kernel, but it is also possible to retrieve the local work-item ID corresponding to the work-group ID. The relationship between the global work-item ID, local work-item ID, and the work-group ID are shown below in **Figure 4.8**. The function used to retrieve these ID's from within the kernel are shown in **Table 4.1**.

**Figure 4.8: Work-group ID and Work-item ID**

![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_8.30.01_AM.png>)

Since 2-D images or 3-D spaces are commonly processed, the work-items and work-groups can be specified in 2 or 3 dimensions. **Figure 4.9** shows an example where the work-group and the work-item are defined in 2-D.

**Figure 4.9: Work-group and work-item defined in 2-D**

![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_8.30.50_AM.png>)

Since the work-group and the work-items can have up to 3 dimensions, the ID's that are used to index **** them also have 3 dimensions. The get\_group\_id(), get\_global\_id(), get\_local\_id() can each take an argument between 0 and 2, each corresponding to the dimension. The ID's for the work-items in **Figure 4.9** are shown below in **Table 4.2**.

**Table 4.2: The ID's of the work-item in Figure 4.8**

| Call                | Retrieved ID  |
| ------------------- | ------------- |
| get\_group\_id(0)   | 1             |
| get\_group\_id(1)   | 0             |
| get\_global\_id(0)  | 10            |
| get\_global\_id(1)  | 5             |
| get\_local\_id(0)   | 2             |
| get\_local\_id(1)   | 5             |

Note that the index space dimension and the number of work-items per work-group can vary depending on the device. The maximum index space dimension can be obtained using the clGetDeviceInfo() function to get the value of CL\_DEVICE\_WORK\_ITEM\_DIMENSIONS, and the maximum number of work-items per work-group can be obtained by getting the value of CL\_DEVICE\_IMAGE\_SUPPORT. The data-type of CL\_DEVICE\_MAX\_WORK\_ITEM is cl\_uint, and for CL\_DEVICE\_IMAGE\_SUPPORT, it is an array of type size\_t.

## _Task Parallelism and Event Object_

The tasks placed in the command-queue are executed in parallel, but in cases where different tasks have data dependencies, they need to be executed sequentially. In OpenCL, the execution order can be set using an event object.

An event object contains information about the execution status of queued commands. This object is returned on all commands that start with "clEnqueue". In order to make sure task A executes before task B, the event object returned when task A is queued can be one of the inputs to task B, which keeps task B from executing until task A is completed.

For example, the function prototype for clPEnqueueTask() is shown below.

> cl\_int clEnqueueTask (cl\_command\_queue command\_queue,
>
> cl\_kernel kernel,
>
> cl\_uint num\_events\_in\_wait\_list,
>
> const cl\_event \*event\_wait\_list,
>
> cl\_event \*event)

The 4th argument is a list of events to be processed before this task can be run, and the 3rd argument is the number of events on the list. The 5th parameter is the event object returned by this task when it is placed in the queue.

**List 4.12** shows an example of how the event objects can be used. In this example, kernel\_A, kernel\_B, kernel\_C, kernel\_D can all be executed in any order, but these must be completed before kernel\_E is executed.

**List 4.12: Event object usage example**

> clEnqueue events\[4];
>
> clEnqueueTask(command\_queue, kernel\_A, 0, NULL, \&events\[0]);
>
> clEnqueueTask(command\_queue, kernel\_B, 0, NULL, \&events\[1]);
>
> clEnqueueTask(command\_queue, kernel\_C, 0, NULL, \&events\[2]);
>
> clEnqueueTask(command\_queue, kernel\_D, 0, NULL, \&events\[3]);
>
> clEnqueueTask(command\_queue, kernel\_E, 4, events, NULL);



| Column - Relationship between execution order and parallel execution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <p>In OpenCL, the tasks placed in the command queue are executed regardless of the order in which it is placed in the queue. In the specification sheet for parallel processors, there is usually a section on "order". When working on parallel processing algorithms, the concept of "order" and "parallel" need to be fully understood. </p><p>First, we will discuss the concept of "order". As an example, let's assume the following 4 tasks are performed sequentially in the order shown below. </p><p>(A) → (B) → (C) → (D) </p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_8.42.40_AM.png>)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| <p>Now, we will switch the order in which task B and C are performed. </p><p>(A) → (C) → (B) → (D) </p><p>If tasks B and C are not dependent on each other, the two sets of tasks will result in the same output. If they are not, the two sets of tasks will not yield the correct result. This problem of whether a certain set of tasks can be performed in different order is a process-dependent problem. </p><p>Parallel processing is a type of optimization that deals with changing the order of tasks. For example, let's assume tasks B and C are processed in parallel. </p><p>In this case, task B may finish before task C, but task D waits for the results of both tasks B and C. This processing is only allowed in the case where the tasks B and C do not depend on each other. Thus, if task C must be performed after task B, then the 2 tasks cannot be processed in parallel. </p><p>On the other hand, it may make more sense to implement all the tasks in a single thread. Also, if the tasks are executed on a single-core processor, all the tasks must be performed sequentially. These need to be considered when implementing an algorithm. </p><p>In essence, two problems must be solved. One is whether some tasks can be executed out of order, and the other is whether to process the tasks in parallel. </p><p>• Tasks must be executed in a specific order = Cannot be parallelized </p><p>• Tasks can be executed out of order = Can be parallelized </p><p>Specifications are written to be a general reference of the capabilities, and do not deal with the actual implementation. Decision to execute certain tasks in parallel is thus not discussed inside the specification. Instead, it contains information such as how certain tasks are guaranteed to be processed in order. </p><p>Explanations on "ordering" is often times difficult to follow (Example: PowerPC's Storage Access Ordering), but often times, treating "order" as the basis when implementing parallel algorithms can clear up existing bottlenecks in the program. </p><p>For example, OpenMP's "parallel" construct specifies the code segment to be executed in parallel, but placing this construct in a single-core processor will not process the code segment in parallel. In this case, one may wonder if it meets OpenMP's specification. If you think about the "parallel" construct as something that tells the compiler and the processors that the loops can be executed out-of-order, it clears up the definition, since it means that the ordering can be changed or the tasks can be run parallel, but that they do not have to be. </p> |
