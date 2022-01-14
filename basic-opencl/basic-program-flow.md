---
description: >-
  This chapter will delve further into writing codes for the host and the
  device. After reading this chapter, you should have the tools necessary for
  implementing a simple OpenCL program.
---

# Basic Program Flow

### **Basic Program Flow**&#x20;

The previous chapter introduced the procedure for building and running an existing sample code. By now, you should have an idea of the basic role of a host program and a kernel program. You should also know the difference between a host memory and a device memory, as well as when to use them.&#x20;

This section will walk through the actual code of the "Hello, World!" program introduced in the last chapter.&#x20;

### _OpenCL Program_&#x20;

Creating an OpenCL program requires writing codes for the host side, as well as for the device side. The device is programmed in OpenCL C, as shown in **List 3.3** hello.cl. The host is programmed in C/C++ using an OpenCL runtime API, as shown in **List 3.4** hello.c.&#x20;

The sections to follow will walk through each code.&#x20;

### _Kernel Code_&#x20;

The function to be executed on the device is defined as shown in **List 4.1**. The OpenCL grammar will be explained in detail in Chapter 5, but for the time being, you can think of it as being the same as the standard C language.&#x20;

**List 4.1: Declaring a function to be executed on the kernel**&#x20;

```
__kernel void hello(__global char * string)
```

The only differences with standard C are the following.

• The function specifier "\_\_kernel" is used when declaring the "hello" function&#x20;

• The address specifier "\_\_global" is used to define the function's string argument&#x20;

The "\_\_kernel" specifies the function to be executed on the device. It must be called by the host, which is done by using one of the following OpenCL runtime API commands.&#x20;

• Task call: clEnqueueTask()&#x20;

• Data-parallel call: clEnqueueNDRangeKernel()&#x20;

Since the kernel is not of a data-parallel nature, the clEnqueueTask() is called from the host to process the kernel.&#x20;

The \_\_global address specifier for the variable "string" tells the kernel that the address space to be used is part of the OpenCL global memory, which is the device-side main memory.&#x20;

The kernel is only allowed read/write access to global, constant, local, and private memory, which is specified by \_\_global, \_\_constant, \_\_local, \_\_private, respectively. If this is not specified, it will assume the address space to be \_\_private, which is the device-side register.&#x20;

### _Host Code_&#x20;

The host program tells the device to execute the kernel using the OpenCL runtime API.&#x20;

Telling the device to execute the hello() kernel only requires the clEnqueueTask() command in the OpenCL runtime API, but other setup procedures must be performed in order to actually run the code. The procedure, which includes initialization, execution, and finalization, is listed below.&#x20;

1\. Get a list of available platforms&#x20;

2\. Select device&#x20;

3\. Create Context&#x20;

4\. Create command queue&#x20;

5\. Create memory objects&#x20;

6\. Read kernel file&#x20;

7\. Create program object The OpenCL Programming Book 78&#x20;

8\. Build kernel&#x20;

9\. Create kernel object&#x20;

10\. Set kernel arguments&#x20;

11\. Execute kernel (Enqueue task) ← hello() kernel function is called here&#x20;

12\. Read memory object&#x20;

13\. Free objects&#x20;

We will go through each step of the procedure using hello.c in **List 3.4** as an example.&#x20;

**Get a List of Available Platform**&#x20;

The first thing that must be done on the host-side is to get a list of available OpenCL platforms. This is done in the following code segment from hello.c in **List 3.4**.&#x20;

```
cl_platform_id platform_id = NULL 
... 
cl_uint ret_num_platforms; 
... 
ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms); 
```

The platform model in OpenCL consists of a host connected to one or more OpenCL devices.&#x20;

The clGetPlatformIDs() function in line 44 allows the host program to discover OpenCL devices, which is returned as a list to the pointer platform\_id of type cl\_platform\_id. The 1st argument specifies how many OpenCL platforms to find which most of the time is one. The 3rd argument returns the number of OpenCL platforms that can be used.&#x20;

#### **Select Device**&#x20;

The next step is to select a GPU device within the platform. This is done in the following code segment from hello.c in **List 3.4**.&#x20;

```
cl_device_id device_id = NULL; 
... 
cl_uint ret_num_devices; 
...
ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id, &ret_num_devices); 
```

The clGetDeviceIDs() function in line 45 selects the device to be used. The 1st argument is the platform that contains the desired device. The 2nd argument specifies the device type. In this case, CL\_DEVICE\_TYPE\_DEFAULT is passed, which specifies whatever set as default in the platform to be used as the device. If the desired device is the GPU, then this should be CL\_DEVICE\_TYPE\_GPU, and if it is CPU, then this should be CL\_DEVICE\_TYPE\_CPU.&#x20;

The 3rd argument specifies the number of devices to use. The 4th argument returns the handle to the selected device. The 5th argument returns the number of devices that corresponds to the device type specified in the 2nd argument. If the specified device does not exist, then ret\_num\_devices will be set to 0.&#x20;

#### **Create Context**&#x20;

After getting the device handle, the next step is to create an OpenCL Context. This is done in the following code segment from hello.c in **List 3.4**.&#x20;

```
cl_context context = NULL; 
... 
context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret); 
```

An OpenCL context is created with one or more devices, using the clCreateContext() function in line 48. The 2nd argument specifies the number of devices to use. The 3rd argument specifies the list of device handlers. The context is used by the OpenCL runtime for managing objects, which will be discussed later.&#x20;

**Create Command Queue**&#x20;

The command queue is used to control the device. In OpenCL, any command from the host to the device, such as kernel execution or memory copy, is performed through this command queue. For each device, one or more command queue objects must be created. This is done in the following code segment from hello.c in **List 3.4**.&#x20;

```
cl_command_queue command_queue = NULL; 
... 
command_queue = clCreateCommandQueue(context, device_id, 0, &ret); 
```

The clCreateCommandQueue() function in line 51 creates the command queue. The 1st argument specifies the context in which the command queue will become part of. The 2nd argument specifies the device which will execute the command in the queue. The function returns a handle to the command queue, which will be used for memory copy and kernel execution.&#x20;

#### **Create Memory Object**&#x20;

To execute a kernel, all data to be processed must be on the device memory. However, the kernel does not have the capability to access memory outside of the device. Therefore, this action must be performed on the host-side. To do this, a memory object must be created, which allows the host to access the device memory. This is done in the following code segment from hello.c in **List 3.4**.&#x20;

> 018: cl\_mem memobj = NULL;&#x20;
>
> ...&#x20;
>
> 054: memobj = clCreateBuffer(context, CL\_MEM\_READ\_WRITE, MEM\_SIZE \* sizeof(char), NULL, \&ret);

The clCreateBuffer() function in line 54 allocates space on the device memory. The allocated memory can be accessed from the host side using the returned memobj pointer. The 1st argument specifies the context in which the memory object will become part of. The 2nd argument specifies a flag describing how it will be used. The CL\_MEM\_READ\_WRITE flag allows the kernel to both read and write to the allocated device memory10. The 3rd argument specifies the number of bytes to allocate. In this example, this allocated storage space gets the character string "Hello, World!", which is done in the hello.cl kernel in **List 3.3**.&#x20;

#### **Read Kernel File**&#x20;

As mentioned earlier, the kernel can only be executed via the host-side program. To do this, the host program must first read the kernel program. This may be in a form of an executable binary, or a source code which must be compiled using an OpenCL compiler. In this example, the host reads the kernel source code. This is done using the standard fread() function.&#x20;

> 028: FILE \*fp;&#x20;
>
> 029: char fileName\[] = "./hello.cl";&#x20;
>
> 030: char \*source\_str;&#x20;
>
> 031: size\_t source\_size;&#x20;
>
> 032:&#x20;
>
> 033: /\* Load kernel code \*/&#x20;
>
> 034: fp = fopen(fileName, "r");&#x20;
>
> 035: if (!fp) {&#x20;
>
> 036: fprintf(stderr, "Failed to load kernel.¥n");&#x20;
>
> 037: exit(1);&#x20;
>
> 038: }&#x20;
>
> 039: source\_str = (char\*)malloc(MAX\_SOURCE\_SIZE);&#x20;
>
> 040: source\_size = fread(source\_str, 1, MAX\_SOURCE\_SIZE, fp);&#x20;
>
> 041: fclose(fp);&#x20;

**Create Program Object**&#x20;

Once the source code is read, this code must be made into a kernel program. This step is required, since the kernel program can contain multiple kernel functions11. This is done by creating a program object, as shown in the following code segment from hello.c in **List 3.4**.&#x20;

> 019: cl\_program program = NULL;&#x20;
>
> ...&#x20;
>
> 057: program = clCreateProgramWithSource(context, 1, (const char \*\*)\&source\_str,&#x20;
>
> 058: (const size\_t \*)\&source\_size, \&ret);&#x20;

The program object is created using the clCreateProgramWithSource() function. The 3rd argument specifies the read-in source code, and the 4th argument specifies the size of the source code in bytes. If the program object is to be created from a binary, clCreateProgramWithBinary() is used instead.&#x20;

**Build**&#x20;

The next step is to build the program object using an OpenCL C compiler and linker.&#x20;

> 061: ret = clBuildProgram(program, 1, \&device\_id, NULL, NULL, NULL);

The clBuildProgram in line 61 builds the program object to create a binary. The 1st argument is the program object to be compiled. The 3rd argument is the target device for which the binary is created. The 2nd argument is the number of target devices. The 4th argument specifies the compiler option string.&#x20;

Note that this step is unnecessary if the program is created from binary using clCreateProgramWithBinary().&#x20;

**Create Kernel Object**&#x20;

Once the program object is compiled, the next step is to create a kernel object. Each kernel object corresponds to each kernel function. Therefore, it is necessary to specify the kernel function's name when creating the kernel object.&#x20;

> 020: cl\_kernel kernel = NULL;&#x20;
>
> ...&#x20;
>
> 064: kernel = clCreateKernel(program, "hello", \&ret);&#x20;

The clCreateKernel() function in line 64 creates the kernel object from the program. The 1st argument specifies the program object, and the 2nd argument sets the kernel function name.&#x20;

This example only has one kernel function for one program object, but it is possible to have multiple kernel functions for one program object. However, since each kernel object corresponds to one kernel function, the clCreateKernel() function must be called multiple times.&#x20;

**Set Kernel Arguments**&#x20;

Once the kernel object is created, the arguments to the kernel must be set. In this example, hello.cl in **List 3.3** expects a pointer to a string array to be built on the device side. This pointer must be specified on the host-side. In this example, the pointer to the allocated memory object is passed in. In this way, the memory management can be performed on the host-side.&#x20;

> 067: ret = clSetKernelArg(kernel, 0, sizeof(cl\_mem), (void \*) \&memobj);

The clSetKernelArg() function in line 67 sets the arguments to be passed into the kernel. The 1st argument is the kernel object. The 2nd argument selects which argument of the kernel is being passed in, which is 0 in this example, meaning the 0th argument to the kernel is being set. The 4th argument is the pointer to the argument to be past in, with the 3rd argument specifying this argument size in bytes. In this way, the clSetKernelArg() must be called for each kernel arguments.&#x20;

Passing of the host-side data as a kernel argument can be done as follows.&#x20;

> int a =10;&#x20;
>
> clSetKernelArg(kernel, 0, sizeof(int), (void \*)\&a);&#x20;

**Execute Kernel (Enqueue task)**&#x20;

The kernel can now finally be executed. This is done by the code segment from hello.c in **List 3.4**&#x20;

> 070: ret = clEnqueueTask(command\_queue, kernel, 0, NULL, NULL);

This throws the kernel into the command queue, to be executed on the compute unit on the device. Note that this function is asynchronous, meaning it just throws the kernel into the queue to be executed on the device. The code that follows the clEnqueueTask() function should account for this.&#x20;

In order to wait for the kernel to finish executing, the 5th argument of the above function must be set as an event object. This will be explained in "4-3-3 Task Parallelism and Event Object".&#x20;

Also, the clEnqueueTask() function is used for task-parallel instructions. Data-parallel instructions should use the clEnqueueNDRangeKernel() function instead.&#x20;

**Read from the memory object**&#x20;

After processing the data on the kernel, the result must now be transferred back to the host-side. This is done in the following code segment from hello.c in **List 3.4**.&#x20;

> 026: char string\[MEM\_SIZE];&#x20;
>
> ...&#x20;
>
> 073: ret = clEnqueueReadBuffer(command\_queue, memobj, CL\_TRUE, 0,&#x20;
>
> 074: MEM\_SIZE \* sizeof(char), string, 0, NULL, NULL);

The clEnqueueReadBuffer() function in lines 73\~74 copies the data on the device-side memory to the host-side memory. To copy the data from the host-side memory to the device-side memory, the clEnqueueWriteBuffer() function is used instead. As the term "Enqueue" in the function indicates, the data copy instruction is placed in the command queue before it is processed. The 2nd argument is the pointer to the memory on the device to be copied over to the host side, while the 5th argument specifies the size of the data in bytes. The 6th argument is the pointer to the host-side memory where the data is copied over to. The 3rd argument specifies whether the command is synchronous or asynchronous. The "CL\_TRUE" that is passed in makes the function synchronous, which keeps the host from executing the next command until the data copy finishes. If "CL\_FALSE" is passed in instead, the copy becomes asynchronous, which queues the task and immediately executes the next instruction on the host-side.&#x20;

Recall, however, that the "hello" kernel was queued asynchronously. This should make you question whether the memory copy from the device is reading valid data.&#x20;

Looking just at the host-side code, it might make you think that this is a mistake. However, in this case it is OK. This is because when the command queue was created, the 3rd argument passed in was a 0, which makes the queued commands execute in order. Therefore, the data copy command waits until the previous command in the queue, the "hello" kernel, is finished. If the command queue was set to allow asynchronous execution, the data copy may start before the kernel finishes its processing of the data, which will achieve incorrect results. Asynchronous kernel execution may be required in some cases, however, and a way to do this is explained in "4-3 Kernel Call".&#x20;

**Free Objects**&#x20;

Lastly, all the objects need to be freed. This is done in the code segment shown below from hello.c in **List 3.4**.&#x20;

> 082: ret = clReleaseKernel(kernel);&#x20;
>
> 083: ret = clReleaseProgram(program);&#x20;
>
> 084: ret = clReleaseMemObject(memobj);&#x20;
>
> 085: ret = clReleaseCommandQueue(command\_queue);&#x20;
>
> 086: ret = clReleaseContext(context);

In real-life applications, the main course of action is usually a repetition of setting kernel arguments or the host-to-device copy -> kernel execution -> device-to-host copy cycle, so object creation/deletion cycle do not usually have to be repeated, since the same object can be used repeatedly. If too many objects are created without freeing, the host-side's object management memory space may run out, in which case the OpenCL runtime will throw an error.&#x20;

****
