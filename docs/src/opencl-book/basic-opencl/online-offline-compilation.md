# Online/Offline Compilation

In OpenCL, a kernel can be compiled either online or offline (**Figure 4.1**).

**Figure 4.1: Offline and Online Compilation**

![](<../.gitbook/assets/Screen_Shot_2022-01-04_at_5.23.59_PM.png>)

The basic difference between the 2 methods is as follows:

• Offline: Kernel binary is read in by the host code

• Online: Kernel source file is read in by the host code

In "offline-compilation", the kernel is pre-built using an OpenCL compiler, and the generated binary is what gets loaded using the OpenCL API. Since the kernel binary is already built, the time lag between starting the host code and the kernel getting executed is negligible. The problem with this method is that in order to execute the program on various platforms, multiple kernel binaries must be included, thus increasing the size of the executable file.

In "online-compilation", the kernel is built from source during runtime using the OpenCL runtime library. This method is commonly known as JIT (Just in time) compilation. The advantage of this method is that the host-side binary can be distributed in a form that's not device-dependent, and that adaptive compiling of the kernel is possible. It also makes the testing of the kernel easier during development, since it gets rid of the need to compile the kernel each time. However, this is not suited for embedded systems that require real-time processing. Also, since the kernel code is in readable form, this method may not be suited for commercial applications.

The OpenCL runtime library contains the set of APIs that performs the above operations. In a way, since OpenCL is a programming framework for heterogeneous environments, the online compilation support should not come as a shock. In fact, a stand-alone OpenCL compiler is not available for the OpenCL environment by NVIDIA, AMD, and Apple. Hence, in order to create a kernel binary in these environments, the built kernels has to be written to a file during runtime by the host program. FOXC on the other hand includes a stand-alone OpenCL kernel compiler, which makes the process of making a kernel binary intuitive.

We will now look at sample programs that show the two compilation methods. The first code shows the online compilation version (**List 4.2**).

**List 4.2: Online Compilation version**

```
#include <stdio.h>
#include <stdlib.h>

#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif

#define MEM_SIZE (128)
#define MAX_SOURCE_SIZE (0x100000)

int main()
{
    cl_platform_id platform_id = NULL;
    cl_device_id device_id = NULL;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;

    float mem[MEM_SIZE];

    FILE *fp;
    const char fileName[] = "./kernel.cl";
    size_t source_size;
    char *source_str;
    cl_int i;

    /* Load kernel source code */
    fp = fopen(fileName, "r");
    if (!fp)
    {
        fprintf(stderr, "Failed to load kernel.¥n");
        exit(1);
    }
    source_str = (char *)malloc(MAX_SOURCE_SIZE);
    source_size = fread(source_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /*Initialize Data */
    for (i = 0; i < MEM_SIZE; i++)
    {
        mem[i] = i;
    }

    /* Get platform/device information */
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id, &ret_num_devices);

    /* Create OpenCL Context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create Command Queue */
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);

    /* Create memory buffer*/
    memobj = clCreateBuffer(context, CL_MEM_READ_WRITE, MEM_SIZE * sizeof(float), NULL, &ret);

    /* Transfer data to memory buffer */
    ret = clEnqueueWriteBuffer(command_queue, memobj, CL_TRUE, 0, MEM_SIZE * sizeof(float), mem, 0, NULL, NULL);

    /* Create Kernel program from the read in source */
    program = clCreateProgramWithSource(context, 1, (const char **)&source_str, (const size_t *)&source_size, &ret);

    /* Build Kernel Program */
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create OpenCL Kernel */
    kernel = clCreateKernel(program, "vecAdd", &ret);

    /* Set OpenCL kernel argument */
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&memobj);

    size_t global_work_size[3] = {MEM_SIZE, 0, 0};
    size_t local_work_size[3] = {MEM_SIZE, 0, 0};

    /* Execute OpenCL kernel */
    ret = clEnqueueNDRangeKernel(command_queue, kernel, 1, NULL, global_work_size, local_work_size, 0, NULL, NULL);

    /* Transfer result from the memory buffer */
    ret = clEnqueueReadBuffer(command_queue, memobj, CL_TRUE, 0, MEM_SIZE * sizeof(float), mem, 0, NULL, NULL);

    /* Display result */
    for (i = 0; i < MEM_SIZE; i++)
    {
        printf("mem[%d] : %f¥n", i, mem[i]);
    }

    /* Finalization */
    ret = clFlush(command_queue);
    ret = clFinish(command_queue);
    ret = clReleaseKernel(kernel);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(memobj);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    free(source_str);

    return 0;
}
```

The following code shows the offline compilation version (**List 4.3**).

**List 4.3 Offline compilation version**

```
#include <stdio.h>
#include <stdlib.h>

#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif

#define MEM_SIZE (128)
#define MAX_BINARY_SIZE (0x100000)

int main()
{
    cl_platform_id platform_id = NULL;
    cl_device_id device_id = NULL;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;

    float mem[MEM_SIZE];

    FILE *fp;
    char fileName[] = "./kernel.clbin";
    size_t binary_size;
    char *binary_buf;
    cl_int binary_status;
    cl_int i;

    /* Load kernel binary */
    fp = fopen(fileName, "r");
    if (!fp)
    {
        fprintf(stderr, "Failed to load kernel.¥n");
        exit(1);
    }
    binary_buf = (char *)malloc(MAX_BINARY_SIZE);
    binary_size = fread(binary_buf, 1, MAX_BINARY_SIZE, fp);
    fclose(fp);

    /* Initialize input data */
    for (i = 0; i < MEM_SIZE; i++)
    {
        mem[i] = i;
    }

    /* Get platform/device information */
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id, &ret_num_devices);

    /* Create OpenCL context*/
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create command queue */
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);

    /* Create memory buffer */
    memobj = clCreateBuffer(context, CL_MEM_READ_WRITE, MEM_SIZE * sizeof(float), NULL, &ret);

    /* Transfer data over to the memory buffer */
    ret = clEnqueueWriteBuffer(command_queue, memobj, CL_TRUE, 0, MEM_SIZE * sizeof(float), mem, 0, NULL, NULL);

    /* Create kernel program from the kernel binary */
    program = clCreateProgramWithBinary(context, 1, &device_id, (const size_t *)&binary_size,
                                        (const unsigned char **)&binary_buf, &binary_status, &ret);

    /* Create OpenCL kernel */
    kernel = clCreateKernel(program, "vecAdd", &ret);
    printf("err:%d¥n", ret);

    /* Set OpenCL kernel arguments */
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&memobj);

    size_t global_work_size[3] = {MEM_SIZE, 0, 0};
    size_t local_work_size[3] = {MEM_SIZE, 0, 0};

    /* Execute OpenCL kernel */
    ret = clEnqueueNDRangeKernel(command_queue, kernel, 1, NULL, global_work_size, local_work_size, 0, NULL, NULL);

    /* Copy result from the memory buffer */
    ret = clEnqueueReadBuffer(command_queue, memobj, CL_TRUE, 0, MEM_SIZE * sizeof(float), mem, 0, NULL, NULL);

    /* Display results */
    for (i = 0; i < MEM_SIZE; i++)
    {
        printf("mem[%d] :%f¥n", i, mem[i]);
    }

    /* Finalization */
    ret = clFlush(command_queue);
    ret = clFinish(command_queue);
    ret = clReleaseKernel(kernel);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(memobj);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    free(binary_buf);

    return 0;
}
```

The kernel program performs vector addition. It is shown below in **List 4.4**.

**List 4.4: Kernel program**

```
__kernel void vecAdd(__global float *a)
{
    int gid = get_global_id(0);

    a[gid] += a[gid];
}
```

We will take a look at the host programs shown in **List 4.2** and **List 4.3**. The two programs are almost identical, so we will focus on their differences.

The first major difference is the fact that the kernel source code is read in the online compile version (**List 4.5**).

**List 4.5: Online compilation version - Reading the kernel source code**

> 035: fp = fopen(fileName, "r");
>
> 036: if (!fp) {
>
> 037: fprintf(stderr, "Failed to load kernel.¥n");
>
> 038: exit(1);
>
> 039: }
>
> 040: source\_str = (char \*)malloc(MAX\_SOURCE\_SIZE);
>
> 041: source\_size = fread(source\_str, 1, MAX\_SOURCE\_SIZE, fp);
>
> 042: fclose(fp);

The source\_str variable is a character array that merely contains the content of the source file. In order to execute this code on the kernel, it must be built using the runtime compiler. This is done by the code segment shown below in **List 4.6**.

**List 4.6: Online compilation version - Create kernel program**

> 065: /\* Create kernel program from the source \*/
>
> 066: program = clCreateProgramWithSource(context, 1, (const char \*\*)\&source\_str, (const size\_t \*)\&source\_size, \&ret);
>
> 067:
>
> 068: /\* Build kernel program \*/
>
> 069: ret = clBuildProgram(program, 1, \&device\_id, NULL, NULL, NULL);

The program is first created from source, and then built.

Next, we will look at the source code for the offline compilation version (**List 4.7**).

**List 4.7: Offline compilation - Reading the kernel binary**

> 036: fp = fopen(fileName, "r");
>
> 037: if (!fp) {
>
> 038: fprintf(stderr, "Failed to load kernel.¥n");
>
> 039: exit(1);
>
> 040: }
>
> 041: binary\_buf = (char \*)malloc(MAX\_BINARY\_SIZE);
>
> 042: binary\_size = fread(binary\_buf, 1, MAX\_BINARY\_SIZE, fp);
>
> 043: fclose(fp);

The code looks very similar to the online version, since the data is being read into a buffer of type char.

The difference is that the data on the buffer can be directly executed. This means that the kernel source code must be compiled beforehand using an OpenCL compiler. The Intel OpenCL Offline Compiler contained Intel OpenCL SDK 1.5 can be used to create a binary of the kernel (**Figure 4.2**).

**Figure 4.2: Intel OpenCL Offline Compiler**

![](<../.gitbook/assets/Screen_Shot_2022-01-04_at_6.16.28_PM.png>)

> /path-to-foxc/bin/foxc -o kernel.clbin kernel.cl

The online compilation version required 2 steps to build the kernel program. With offline compilation, the clCreateProgramWithSource() is replaced with clCreateProgramWithBinary.

> 067: program = clCreateProgramWithBinary(context, 1, \&device\_id, (const size\_t \*)\&binary\_size,
>
> 068: (const unsigned char \*\*)\&binary\_buf, \&binary\_status, \&ret);

Since the kernel is already built, there is no reason for another build step as in the online compilation version.

To summarize, in order to change the method of compilation from online to offline, the following steps are followed:

1\. Read the kernel as a binary

2\. Change clCreateProgramWithSource() to clCreateProgramWithBinary()

3\. Get rid of clBuildProgram()

This concludes the differences between the two methods. See Chapter 8 for the details on the APIs used inside the sample codes.
