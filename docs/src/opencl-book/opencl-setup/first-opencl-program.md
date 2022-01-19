---
description: >-
  From this section onward, we will start learning the OpenCL programming basics
  by building and running actual code.
---

# First OpenCL Program

Since we have not yet gone over the OpenCL grammar, you should concentrate on the general flow of OpenCL programming.

_Hello World_&#x20;

**List 3.3** and **3.4** shows the familiar "Hello, World!" program written in OpenCL. Since standard in/out cannot be used within the kernel, we will use the kernel only to set the char array. Note that printf() will be available starting in OpenCL 1.2 to perform the same action. In this program, the string set on the kernel will be copied over to the host side, which can then be outputted. (The code can be downloaded from http://www.fixstars.com/books/opencl)&#x20;

**List 3.3: Hello World - kernel (hello.cl)**&#x20;

```
__kernel void hello(__global char *string)
{
    string[0] = 'H';
    string[1] = 'e';
    string[2] = 'l';
    string[3] = 'l';
    string[4] = 'o';
    string[5] = ',';
    string[6] = ' ';
    string[7] = 'W';
    string[8] = 'o';
    string[9] = 'r';
    string[10] = 'l';
    string[11] = 'd';
    string[12] = '!';
    string[13] = '¥0';
}
```

**List 3.4: Hello World - host (hello.c)**&#x20;

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
    cl_device_id device_id = NULL;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;

    char string[MEM_SIZE];

    FILE *fp;
    char fileName[] = "./hello.cl";
    char *source_str;
    size_t source_size;

    /* Load the source code containing the kernel*/
    fp = fopen(fileName, "r");
    if (!fp)
    {
        fprintf(stderr, "Failed to load kernel.¥n");
        exit(1);
    }
    source_str = (char *)malloc(MAX_SOURCE_SIZE);
    source_size = fread(source_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Get Platform and Device Info */
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id, &ret_num_devices);

    /* Create OpenCL context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create Command Queue */
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);

    /* Create Memory Buffer */
    memobj = clCreateBuffer(context, CL_MEM_READ_WRITE, MEM_SIZE * sizeof(char), NULL, &ret);

    /* Create Kernel Program from the source */
    program = clCreateProgramWithSource(context, 1, (const char **)&source_str,
                                        (const size_t *)&source_size, &ret);

    /* Build Kernel Program */
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create OpenCL Kernel */
    kernel = clCreateKernel(program, "hello", &ret);

    /* Set OpenCL Kernel Parameters */
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&memobj);

    /* Execute OpenCL Kernel */
    ret = clEnqueueTask(command_queue, kernel, 0, NULL, NULL);

    /* Copy results from the memory buffer */
    ret = clEnqueueReadBuffer(command_queue, memobj, CL_TRUE, 0,
                              MEM_SIZE * sizeof(char), string, 0, NULL, NULL);

    /* Display Result */
    puts(string);

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

The include header is located in a different directory depending on the environment (**Table 3.6**). Make sure to specify the correct location.&#x20;

**Table 3.6: Difference between include header names (as of March 2011)**&#x20;

| OpenCL implementation  | Include Header   |
| ---------------------- | ---------------- |
| AMD                    | CL/cl.h          |
| Apple                  | OpenCL/opencl.h  |
| FOXC                   | CL/cl.h          |
| NVIDIA                 | CL/cl.h          |

> \#ifdef \_\_APPLE\_\_&#x20;
>
> \#include \<OpenCL/opencl.h>&#x20;
>
> \#else&#x20;
>
> \#include \<CL/cl.h>&#x20;
>
> \#endif&#x20;

### _Building in Linux/Mac OS X_&#x20;

Once the program is written, we are now ready to build and run the program. This section will describe the procedure under Linux/Mac OS X. The kernel and host code are assumed to exist within the same directory.&#x20;

The procedures for building vary depending on the OpenCL implementation. "path-to-..." should be replaced with the corresponding OpenCL SDK path. The default SDK path is as shown in **Figure 3.7** and **Figure 3.8**.&#x20;

**Table 3.7: Location of the OpenCL include header files (cl.h)**&#x20;

| Environment           | Default location             | Notes                        |
| --------------------- | ---------------------------- | ---------------------------- |
| Intel OpenCL SDK 1.5  | /usr/include/CL/             |                              |
| Apple Xcode 3,4       | -                            | Taken care of automatically  |
| NVIDIA CUDA 4.x       | /usr/local/cuda/include/CL/  |                              |
| AMD APP SDK v2.6      | /opt/AMDAPP/include/CL/      |                              |

**Table 3.8: Location of the OpenCL library files (libOpenCL.so)**&#x20;

| Environment           | Default location  | Notes                        |
| --------------------- | ----------------- | ---------------------------- |
| Intel OpenCL SDK 1.5  | /usr/lib64/       | 64-bit only                  |
| Apple Xcode 3,4       | -                 | Taken care of automatically  |
| NVIDIA CUDA 4.x       | /usr/lib/         | 32-bit                       |
| /usr/lib64/           | 64-bit            |                              |
| AMD APP SDK v2.6      | /usr/lib/         | 32-bit                       |
| /usr/lib64/           | 64-bit            |                              |

If you changed the SDK location during the installation, you will have to make changes accordingly. Also, installing from a package provided by the distribution may place the SDK elsewhere.&#x20;

The build commands on Linux/Max OS X are as follows:&#x20;

**Intel**&#x20;

For Intel OpenCL SDK, the headers and libraries are placed such that the build tools will be able to find them. Use the command below for building.&#x20;

> gcc -o hello hello.c -lOpenCL

**Apple**&#x20;

When using Apple OpenCL, specify "-framework opencl" as a build argument. You are not required to explicitly specify the location of headers and libraries, as this will be taken care of.&#x20;

> gcc -o hello hello.c -framework opencl&#x20;

**AMD**&#x20;

For AMD, since the headers are located under /opt, you will have to specify the header location in the compile option. However, since the libraries are located in the default search path, this does not have to be passed in.&#x20;

> gcc -I/opt/AMDAPP/include -o hello hello.c -lOpenCL&#x20;

**NVIDIA**&#x20;

For NVIDIA, the exact same rule applies as for AMD.&#x20;

> gcc -I/usr/local/cuda/include -o hello hello.c -lOpenCL&#x20;

The sample provided includes a Makefile that can be used on Linux and Mac OS X. A build for each platform can be performed as follows:&#x20;

> \> make intel (For Linux)&#x20;
>
> \> make apple (For Mac OS X)&#x20;
>
> \> make nvidia (For Linux)&#x20;
>
> \> make amd (For Linux)&#x20;

This should create an executable with the name "hello" in working directory. Run the executable as follows. If successful, you should get "Hello World!" on the screen.

> \> ./hello&#x20;
>
> Hello World!&#x20;

As a known restriction exist for the AMD APP SDK, access rights to the X server is required to use the GPU as an OpenCL device. To use an AMD GPU remotely, follow the procedures contained in this PDF released by AMD:&#x20;

http://developer.amd.com/sdks/AMDAPPSDK/assets/App_Note-Running_AMD_APP_Apps_Remotely.pdf

### _Building on Visual Studio_&#x20;

This section will walk through the building and execution process using Visual C++ 2010 Express under 32-bit Windows 7 environment. The OpenCL header file and library can be included to be used on a project using the following steps.&#x20;

1\. From the project page, go to “C/C++” -> “General”, then add the following in the box for “Additional include directories”:&#x20;

**Intel**&#x20;

Intel OpenCL declares an environmental variable INTELOCLSDKROOT whose value is the root path of the SDK.&#x20;

> $(INTELOCLSDKROOT)include&#x20;

**NVIDIA**&#x20;

The include path is specified in the environmental variable CUDA\_INC\_PATH.&#x20;

> $(CUDA\_INC\_PATH)&#x20;

**AMD**&#x20;

AMD APP SDK declares an environmental variable AMDAPPSDKROOT whose value is the root path of the SDK.&#x20;

> $(AMDAPPSDKROOT)include&#x20;

2\. From the project page, go to “Linker” -> “Input”, and in the box for “Additional library path”, type the following.&#x20;

**Intel**&#x20;

> $(INTELOCLSDKROOT)lib¥x86 (32bit, for Visual C++ 2010 Express)&#x20;

> $(INTELOCLSDKROOT)lib¥x64 (64bit)&#x20;

**NVIDIA**&#x20;

> $(CUDA\_PATH)lib¥Win32 (32bit, for Visual C++ 2010 Express)&#x20;

> $(CUDA\_PATH)lib¥x64 (64bit)&#x20;

**AMD**&#x20;

> $(AMDAPPSDKROT)lib¥x86 (32bit, for Visual C++ 2010 Express)&#x20;

> $(AMDAPPSDKROT)lib¥x86\_64 (64bit)&#x20;

3\. From the project page, go to "Linker" -> "Input", and in the box for "Additional Dependencies", type the following.&#x20;

**Intel, NVIDIA and AMD**&#x20;

OpenCL.lib&#x20;

These should apply to All Configurations, which can be selected on the pull-down menu located on the top left corner.&#x20;

The environment should now be setup to allow an OpenCL code to be built on. Build and run the sample code, and make sure you get the correct output.&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-03 at 9.14.21 PM.png>)
